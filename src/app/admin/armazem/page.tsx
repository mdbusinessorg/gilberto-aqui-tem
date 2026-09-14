import Image from 'next/image'
import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, CardHeader, CardBody, Table, THead, TBody, StatusBadge, EmptyState, Input, Button, Badge } from '@/components/ui'
import { formatKz, formatDateTime } from '@/lib/utils'
import { MOVEMENT_TYPES } from '@/lib/labels'
import { MovementForm } from './movement-form'

export const dynamic = 'force-dynamic'

export default async function WarehousePage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient()
  const [locationResult, productResult, movementResult] = await Promise.all([
    supabase.from('inventory_locations').select('*').order('sort_order'),
    supabase.from('products').select('id,name,sku,is_active,stock_total,min_stock,price,cost_price,inventory(location_id,quantity),product_images(url,is_primary,sort_order)').order('name'),
    supabase.from('inventory_movements').select('*, products!inventory_movements_product_id_fkey(name,sku), profiles(full_name), location:inventory_locations!inventory_movements_location_id_fkey(name), destination:inventory_locations!inventory_movements_to_location_id_fkey(name)').order('created_at', { ascending: false }).limit(50),
  ])
  if (locationResult.error || productResult.error || movementResult.error) throw new Error('Não foi possível carregar o inventário. Tenta novamente.')
  const locations = locationResult.data
  const products = productResult.data
  const movements = movementResult.data
  const inventory = products.flatMap((p) => p.inventory.map((i) => ({ ...i, product_id: p.id })))
  const physicalStock = new Map(products.map((p) => [p.id, p.inventory.reduce((sum, i) => sum + i.quantity, 0)]))
  const low = products.filter((p) => p.is_active && p.stock_total <= p.min_stock)
  const totalCost = products.reduce((a, p) => a + (physicalStock.get(p.id) ?? 0) * Number(p.cost_price ?? 0), 0)
  const totalRetail = products.reduce((a, p) => a + (physicalStock.get(p.id) ?? 0) * Number(p.price ?? 0), 0)
  const query = (searchParams.q ?? '').trim().toLocaleLowerCase('pt-PT')
  const visible = products.filter((p) => `${p.name} ${p.sku}`.toLocaleLowerCase('pt-PT').includes(query))

  return (
    <>
      <PageHeader title="Armazém virtual" description="O mesmo catálogo, com as quantidades físicas registadas em cada localização."
        actions={<MovementForm products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }))} locations={locations.filter((l) => l.is_active).map((l) => ({ id: l.id, name: l.name }))} inventory={inventory} />} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-ink-muted">Unidades físicas registadas</p><p className="mt-1 text-xl font-semibold tabular">{inventory.reduce((sum, i) => sum + i.quantity, 0)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Valor de custo</p><p className="mt-1 text-xl font-semibold tabular">{formatKz(totalCost)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Valor de venda</p><p className="mt-1 text-xl font-semibold tabular">{formatKz(totalRetail)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Alertas de stock</p><p className="mt-1 text-xl font-semibold tabular text-amber-600">{low.length}</p></Card>
      </div>
      <Card className="mb-6">
        <CardHeader title="Produtos por localização" description="Uma linha por produto. Zero significa que não há unidades registadas nesse local; transferir move o stock entre locais." />
        <form className="flex gap-3 border-b border-line p-4">
          <Input name="q" aria-label="Pesquisar produto ou SKU no armazém" placeholder="Pesquisar produto ou SKU…" defaultValue={searchParams.q} />
          <Button type="submit" variant="outline">Pesquisar</Button>
        </form>
        <Table>
          <THead><tr><th>Produto</th>{locations.map((l) => <th key={l.id} className="text-right whitespace-nowrap">{l.name}{!l.is_active && <span className="block normal-case">Inactiva</span>}</th>)}<th className="text-right">Total físico</th><th className="text-right">Disponível para venda</th></tr></THead>
          <TBody>
            {visible.map((p) => {
              const image = [...p.product_images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0]
              return (
                <tr key={p.id}>
                  <td><div className="flex min-w-48 items-center gap-3">
                    {image ? <Image src={image.url} alt={p.name} width={40} height={40} unoptimized className="h-10 w-10 object-contain" /> : <Package className="h-8 w-8 shrink-0 text-ink-muted" />}
                    <div><p className="font-medium">{p.name}</p><p className="text-xs text-ink-muted">{p.sku}</p>{!p.is_active && <Badge>Oculto na loja</Badge>}</div>
                  </div></td>
                  {locations.map((l) => <td key={l.id} className="text-right tabular">{p.inventory.find((i) => i.location_id === l.id)?.quantity ?? 0}</td>)}
                  <td className="text-right tabular font-semibold">{physicalStock.get(p.id) ?? 0}</td>
                  <td className="text-right tabular">{p.stock_total}</td>
                </tr>
              )
            })}
          </TBody>
        </Table>
        {!visible.length && <EmptyState compact title="Nenhum produto encontrado" description="Cria produtos no painel de Produtos e regista aqui a entrada das quantidades recebidas." />}
        <div className="space-y-1 border-t border-line p-4 text-xs text-ink-muted">
          <p>O disponível para venda soma as localizações habilitadas para venda. Regista cada entrada, saída ou contagem física em «Novo movimento» para manter o saldo actualizado.</p>
          <p>Os pedidos online descontam unidades da Loja Principal ao confirmar. Transfere para esse local as unidades que vais entregar antes de confirmar o pedido.</p>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Localizações" />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {(locations ?? []).map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="font-medium">{l.name}<span className="ml-2 text-xs text-ink-muted">{l.sells ? 'Para venda' : 'Fora de venda'}</span></span><span className="text-sm tabular">{inventory.filter((i) => i.location_id === l.id).reduce((sum, i) => sum + i.quantity, 0)} un.</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Stock baixo" />
          <CardBody className="px-0 py-0">
            {low.length === 0 ? <EmptyState compact title="Stock sob controlo" /> : (
              <ul className="divide-y divide-line">
                {low.map((p) => <li key={p.id} className="flex items-center justify-between px-5 py-2.5 text-sm"><span className="font-medium">{p.name} <span className="text-xs text-ink-muted">{p.sku}</span></span><span className="tabular text-amber-600">{p.stock_total}/{p.min_stock}</span></li>)}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader title="Movimentos recentes" />
        <Table>
          <THead><tr><th>Tipo</th><th>Produto</th><th>Qtd</th><th>Local / destino</th><th>Por</th><th>Motivo</th><th>Data</th></tr></THead>
          <TBody>
            {(movements ?? []).map((m) => (
              <tr key={m.id}>
                <td><StatusBadge map={MOVEMENT_TYPES} value={m.type} /></td>
                <td><span className="font-medium">{m.products?.name}</span> <span className="text-xs text-ink-muted">{m.products?.sku}</span></td>
                <td className="tabular font-medium">{m.quantity}</td>
                <td className="text-ink-muted">{m.location?.name ?? '—'}{m.destination && <span className="block">→ {m.destination.name}</span>}</td>
                <td className="text-ink-muted">{m.profiles?.full_name ?? '—'}</td>
                <td className="max-w-48 truncate text-xs text-ink-muted">{m.reason ?? m.notes ?? '—'}</td>
                <td className="text-xs text-ink-muted">{formatDateTime(m.created_at)}</td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!movements?.length && <EmptyState compact title="Sem movimentos" />}
      </Card>
    </>
  )
}

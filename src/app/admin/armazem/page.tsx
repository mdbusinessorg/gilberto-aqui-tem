import Image from 'next/image'
import Link from '@/components/ui/navigation-link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Package, Warehouse } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, CardHeader, Table, THead, TBody, StatusBadge, EmptyState, Input, Button, ButtonLink, Badge } from '@/components/ui'
import { formatKz, formatDateTime } from '@/lib/utils'
import { MOVEMENT_TYPES } from '@/lib/labels'
import { MovementForm } from './movement-form'

export const dynamic = 'force-dynamic'

export default async function WarehousePage({ searchParams }: { searchParams: { q?: string; local?: string } }) {
  const supabase = createClient()
  const [locationResult, productResult] = await Promise.all([
    supabase.from('inventory_locations').select('*').order('sort_order'),
    supabase.from('products').select('id,name,sku,is_active,stock_total,min_stock,price,cost_price,inventory(location_id,quantity),product_images(url,is_primary,sort_order)').order('name'),
  ])
  if (locationResult.error || productResult.error) throw new Error('Não foi possível carregar o inventário. Tenta novamente.')
  const locations = locationResult.data
  const products = productResult.data
  const selected = locations.find((l) => l.slug === searchParams.local)
  if (searchParams.local && !selected) notFound()
  let movementQuery = supabase.from('inventory_movements').select('*, products!inventory_movements_product_id_fkey(name,sku), profiles(full_name), location:inventory_locations!inventory_movements_location_id_fkey(name), destination:inventory_locations!inventory_movements_to_location_id_fkey(name)')
  if (selected) movementQuery = movementQuery.or(`location_id.eq.${selected.id},to_location_id.eq.${selected.id}`)
  const movementResult = await movementQuery.order('created_at', { ascending: false }).limit(50)
  if (movementResult.error) throw new Error('Não foi possível carregar os movimentos. Tenta novamente.')
  const movements = movementResult.data
  const inventory = products.flatMap((p) => p.inventory.map((i) => ({ ...i, product_id: p.id })))
  const scopedInventory = selected ? inventory.filter((i) => i.location_id === selected.id) : inventory
  const physicalStock = new Map(products.map((p) => [p.id, p.inventory.filter((i) => !selected || i.location_id === selected.id).reduce((sum, i) => sum + i.quantity, 0)]))
  const low = products.filter((p) => p.is_active && p.stock_total <= p.min_stock)
  const totalCost = products.reduce((a, p) => a + (physicalStock.get(p.id) ?? 0) * Number(p.cost_price ?? 0), 0)
  const totalRetail = products.reduce((a, p) => a + (physicalStock.get(p.id) ?? 0) * Number(p.price ?? 0), 0)
  const query = (searchParams.q ?? '').trim().toLocaleLowerCase('pt-PT')
  const localProducts = selected ? products.filter((p) => (physicalStock.get(p.id) ?? 0) > 0) : []
  const visible = localProducts.filter((p) => `${p.name} ${p.sku}`.toLocaleLowerCase('pt-PT').includes(query))

  return (
    <>
      {selected && <ButtonLink href="/admin/armazem" variant="outline" size="sm" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Todas as localizações</ButtonLink>}
      <PageHeader title={selected ? selected.name : 'Armazém virtual'}
        description={selected ? 'Produtos e quantidades registados nesta localização.' : 'Abre uma localização para consultar os seus produtos e controlar o stock.'}
        actions={<MovementForm key={selected?.id ?? 'all'} defaultLocationId={selected?.is_active ? selected.id : ''} products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }))} locations={locations.filter((l) => l.is_active).map((l) => ({ id: l.id, name: l.name }))} inventory={inventory} />} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-ink-muted">{selected ? 'Unidades neste local' : 'Unidades físicas registadas'}</p><p className="mt-1 text-xl font-semibold tabular">{scopedInventory.reduce((sum, i) => sum + i.quantity, 0)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Valor de custo</p><p className="mt-1 text-xl font-semibold tabular">{formatKz(totalCost)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Valor de venda</p><p className="mt-1 text-xl font-semibold tabular">{formatKz(totalRetail)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">{selected ? 'Produtos neste local' : 'Alertas de stock'}</p><p className="mt-1 text-xl font-semibold tabular">{selected ? localProducts.length : low.length}</p></Card>
      </div>
      {!selected ? (
        <section aria-label="Localizações do armazém" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {locations.map((l) => {
            const stock = inventory.filter((i) => i.location_id === l.id && i.quantity > 0)
            return (
              <Link key={l.id} href={`/admin/armazem?local=${encodeURIComponent(l.slug)}`}
                className="group rounded-xl border border-line bg-white p-6 transition-colors hover:border-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                <div className="mb-5 flex items-center justify-between">
                  <Warehouse aria-hidden="true" className="h-12 w-12 text-brand-600" strokeWidth={1.5} />
                  <Badge>{l.is_active ? (l.sells ? 'Para venda' : 'Fora de venda') : 'Inactiva'}</Badge>
                </div>
                <h2 className="text-lg font-semibold">{l.name}</h2>
                <p className="mt-2 text-sm text-ink-muted">{stock.length} produtos · {stock.reduce((sum, i) => sum + i.quantity, 0)} unidades</p>
                <span className="mt-5 flex items-center gap-2 text-sm font-medium text-brand-600">Abrir localização <ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
              </Link>
            )
          })}
          {!locations.length && <EmptyState title="Sem localizações disponíveis" />}
        </section>
      ) : <Card className="mb-6">
        <CardHeader title={`Produtos — ${selected.name}`} description="Apenas produtos com unidades registadas neste local." />
        <form className="flex gap-3 border-b border-line p-4">
          <input type="hidden" name="local" value={selected.slug} />
          <Input key={`${selected.id}-${searchParams.q ?? ''}`} name="q" aria-label="Pesquisar produto ou SKU nesta localização" placeholder="Pesquisar produto ou SKU…" defaultValue={searchParams.q} />
          <Button type="submit" variant="outline">Pesquisar</Button>
        </form>
        <Table>
          <THead><tr><th>Produto</th><th className="text-right">Quantidade neste local</th><th className="text-right">Preço de venda</th></tr></THead>
          <TBody>
            {visible.map((p) => {
              const image = [...p.product_images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0]
              return (
                <tr key={p.id}>
                  <td><div className="flex min-w-48 items-center gap-3">
                    {image ? <Image src={image.url} alt={p.name} width={40} height={40} unoptimized className="h-10 w-10 object-contain" /> : <Package className="h-8 w-8 shrink-0 text-ink-muted" />}
                    <div><p className="font-medium">{p.name}</p><p className="text-xs text-ink-muted">{p.sku}</p>{!p.is_active && <Badge>Oculto na loja</Badge>}</div>
                  </div></td>
                  <td className="text-right tabular font-semibold">{physicalStock.get(p.id) ?? 0}</td>
                  <td className="text-right tabular">{formatKz(p.price)}</td>
                </tr>
              )
            })}
          </TBody>
        </Table>
        {!visible.length && <EmptyState compact title={query ? 'Nenhum produto encontrado' : 'Esta localização está vazia'}
          description={query ? 'Pesquisa outro nome ou SKU nesta localização.' : 'Regista uma entrada ou uma transferência para este local em «Novo movimento».'} />}
        <div className="space-y-1 border-t border-line p-4 text-xs text-ink-muted">
          <p>O disponível para venda soma as localizações habilitadas para venda. Regista cada entrada, saída ou contagem física em «Novo movimento» para manter o saldo actualizado.</p>
          <p>Os pedidos online descontam unidades da Loja Principal ao confirmar. Transfere para esse local as unidades que vais entregar antes de confirmar o pedido.</p>
        </div>
      </Card>}
      <Card className="mt-6">
        <CardHeader title={selected ? `Movimentos — ${selected.name}` : 'Movimentos recentes'} />
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

import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, CardHeader, CardBody, Table, THead, TBody, StatusBadge, EmptyState } from '@/components/ui'
import { formatKz, formatDateTime } from '@/lib/utils'
import { MOVEMENT_TYPES } from '@/lib/labels'
import { MovementForm } from './movement-form'

export const dynamic = 'force-dynamic'

export default async function WarehousePage() {
  const supabase = createClient()
  const [{ data: locations }, { data: products }, { data: movements }] = await Promise.all([
    supabase.from('inventory_locations').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('products').select('id,name,sku,stock_total,min_stock,price,cost_price').eq('is_active', true).order('name'),
    supabase.from('inventory_movements').select('*, products!inventory_movements_product_id_fkey(name,sku), profiles(full_name), location:inventory_locations!inventory_movements_location_id_fkey(name)').order('created_at', { ascending: false }).limit(50),
  ])
  const low = (products ?? []).filter((p) => p.stock_total <= p.min_stock)
  const totalCost = (products ?? []).reduce((a, p) => a + p.stock_total * Number(p.cost_price ?? 0), 0)
  const totalRetail = (products ?? []).reduce((a, p) => a + p.stock_total * Number(p.price ?? 0), 0)

  return (
    <>
      <PageHeader title="Armazém" description="Stock, localizações e movimentos de inventário." actions={<MovementForm products={(products ?? []).map((p) => ({ id: p.id, name: p.name, sku: p.sku }))} locations={(locations ?? []).map((l) => ({ id: l.id, name: l.name }))} />} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-ink-muted">Unidades em stock</p><p className="mt-1 text-xl font-semibold tabular">{(products ?? []).reduce((a, p) => a + p.stock_total, 0)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Valor de custo</p><p className="mt-1 text-xl font-semibold tabular">{formatKz(totalCost)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Valor de venda</p><p className="mt-1 text-xl font-semibold tabular">{formatKz(totalRetail)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Alertas de stock</p><p className="mt-1 text-xl font-semibold tabular text-amber-600">{low.length}</p></Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Localizações" />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {(locations ?? []).map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="font-medium">{l.name}</span><span className="text-xs text-ink-muted">{l.slug}</span>
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
          <THead><tr><th>Tipo</th><th>Produto</th><th>Qtd</th><th>Local</th><th>Por</th><th>Motivo</th><th>Data</th></tr></THead>
          <TBody>
            {(movements ?? []).map((m) => (
              <tr key={m.id}>
                <td><StatusBadge map={MOVEMENT_TYPES} value={m.type} /></td>
                <td><span className="font-medium">{m.products?.name}</span> <span className="text-xs text-ink-muted">{m.products?.sku}</span></td>
                <td className="tabular font-medium">{m.quantity}</td>
                <td className="text-ink-muted">{m.location?.name ?? '—'}</td>
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

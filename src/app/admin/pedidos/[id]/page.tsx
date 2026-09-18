import Link from '@/components/ui/navigation-link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, CardHeader, CardBody, StatusBadge } from '@/components/ui'
import { formatKz, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS, PAYMENT_STATUS, CHANNEL_LABELS } from '@/lib/labels'
import { OrderActions } from './actions'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: o } = await supabase.from('orders').select('*, order_items(*), order_status_history(*)').eq('id', params.id).single()
  if (!o) notFound()
  const history = [...(o.order_status_history ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)).reverse()

  return (
    <>
      <PageHeader title={o.order_number} description={`${o.customer_name} · ${formatDateTime(o.created_at)}`}
        breadcrumb={<Link href="/admin/pedidos" className="hover:text-ink">← Pedidos</Link>}
        actions={<OrderActions order={o} />} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Itens" />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {(o.order_items ?? []).map((i) => (
                <li key={i.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div><p className="font-medium">{i.product_name}</p><p className="text-xs text-ink-muted">{i.sku} · {formatKz(i.unit_price)} ×{i.quantity}</p></div>
                  <span className="tabular font-medium">{formatKz(i.total)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Subtotal</span><span className="tabular">{formatKz(o.subtotal)}</span></div>
              {Number(o.discount) > 0 && <div className="flex justify-between text-emerald-700"><span>Desconto{o.coupon_code ? ` (${o.coupon_code})` : ''}</span><span className="tabular">−{formatKz(o.discount)}</span></div>}
              {Number(o.delivery_fee) > 0 && <div className="flex justify-between"><span className="text-ink-muted">Entrega</span><span className="tabular">{formatKz(o.delivery_fee)}</span></div>}
              <div className="flex justify-between pt-1 text-base font-semibold"><span>Total</span><span className="tabular">{formatKz(o.total)}</span></div>
            </div>
          </CardBody>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Detalhes" />
            <CardBody className="space-y-3 text-sm">
              <Row k="Cliente" v={<>{o.customer_name}<span className="block text-xs text-ink-muted">{o.customer_phone}{o.customer_email ? ` · ${o.customer_email}` : ''}</span></>} />
              <Row k="Canal" v={CHANNEL_LABELS[o.channel]} />
              <Row k="Entrega" v={o.delivery_method === 'entrega' ? `Entrega — ${o.delivery_address ?? ''}` : 'Levantamento na loja'} />
              <Row k="Pagamento" v={<StatusBadge map={PAYMENT_STATUS} value={o.payment_status} />} />
              {o.payment_method && <Row k="Método" v={o.payment_method} />}
              <Row k="Estado" v={<StatusBadge map={ORDER_STATUS} value={o.status} />} />
              {o.notes && <Row k="Notas" v={o.notes} />}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Histórico" />
            <CardBody>
              <ul className="space-y-2.5 text-sm">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3">
                    <StatusBadge map={ORDER_STATUS} value={h.status} />
                    <span className="flex-1 text-xs text-ink-muted">{h.note}</span>
                    <span className="text-xs text-ink-muted">{formatDateTime(h.created_at)}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4"><span className="text-ink-muted shrink-0">{k}</span><span className="text-right font-medium">{v}</span></div>
}

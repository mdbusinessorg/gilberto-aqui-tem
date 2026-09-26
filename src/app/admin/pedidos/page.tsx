import Link from '@/components/ui/navigation-link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, StatusBadge, EmptyState, Input, Select, Button } from '@/components/ui'
import { formatKz, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS, PAYMENT_STATUS, CHANNEL_LABELS } from '@/lib/labels'
import type { OrderStatus, PaymentStatus, OrderChannel } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function OrdersPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient()
  let q = supabase.from('orders').select('id,order_number,customer_name,customer_phone,total,status,payment_status,channel,created_at').order('created_at', { ascending: false }).limit(100)
  if (searchParams.estado) q = q.eq('status', searchParams.estado as OrderStatus)
  if (searchParams.canal) q = q.eq('channel', searchParams.canal as OrderChannel)
  if (searchParams.de) q = q.gte('created_at', `${searchParams.de}T00:00:00`)
  if (searchParams.ate) q = q.lte('created_at', `${searchParams.ate}T23:59:59`)
  if (searchParams.q) {
    const t = searchParams.q.replace(/[%_,()]/g, ' ')
    q = q.or(`order_number.ilike.%${t}%,customer_name.ilike.%${t}%,customer_phone.ilike.%${t}%`)
  }
  const { data: orders } = await q
  return (
    <>
      <PageHeader title="Pedidos & Vendas" description={`${orders?.length ?? 0} pedidos`} />
      <Card>
        <form className="flex flex-wrap items-end gap-3 border-b border-line p-4">
          <div className="min-w-48 flex-1"><Input name="q" placeholder="Nº pedido, cliente ou telefone" defaultValue={searchParams.q} /></div>
          <Select name="estado" defaultValue={searchParams.estado ?? ''} className="w-48">
            <option value="">Todos os estados</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Select name="canal" defaultValue={searchParams.canal ?? ''} className="w-40">
            <option value="">Todos os canais</option>
            {Object.entries(CHANNEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input type="date" name="de" defaultValue={searchParams.de} className="w-40" />
          <Input type="date" name="ate" defaultValue={searchParams.ate} className="w-40" />
          <Button type="submit" variant="outline">Filtrar</Button>
        </form>
        <Table>
          <THead><tr><th>Pedido</th><th>Cliente</th><th>Canal</th><th>Pagamento</th><th>Estado</th><th className="text-right">Total</th><th>Data</th></tr></THead>
          <TBody>
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td><Link href={`/admin/pedidos/${o.id}`} className="font-medium text-brand-700 hover:underline">{o.order_number}</Link></td>
                <td><p className="font-medium">{o.customer_name}</p><p className="text-xs text-ink-muted">{o.customer_phone}</p></td>
                <td className="text-ink-muted">{CHANNEL_LABELS[o.channel]}</td>
                <td><StatusBadge map={PAYMENT_STATUS} value={o.payment_status} /></td>
                <td><StatusBadge map={ORDER_STATUS} value={o.status} /></td>
                <td className="text-right font-medium tabular">{formatKz(o.total)}</td>
                <td className="text-xs text-ink-muted">{formatDateTime(o.created_at)}</td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!orders?.length && <EmptyState compact title="Sem pedidos" />}
      </Card>
    </>
  )
}

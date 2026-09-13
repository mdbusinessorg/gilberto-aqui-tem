import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, StatusBadge, EmptyState } from '@/components/ui'
import { formatKz, formatDate, formatDateTime } from '@/lib/utils'
import { PO_STATUS, RETURN_STATUS } from '@/lib/labels'
import { PoActions } from './actions'

export const dynamic = 'force-dynamic'

export default async function PurchasesPage() {
  const supabase = createClient()
  const [{ data: pos }, { data: returns }] = await Promise.all([
    supabase.from('purchase_orders').select('*, suppliers(name), purchase_order_items(*)').order('created_at', { ascending: false }).limit(50),
    supabase.from('returns').select('*, orders(order_number), products(name)').order('created_at', { ascending: false }).limit(50),
  ])
  return (
    <>
      <PageHeader title="Compras & Devoluções" description="Ordens de compra a fornecedores e devoluções de clientes." />
      <Card>
        <Table>
          <THead><tr><th>PO</th><th>Fornecedor</th><th>Itens</th><th className="text-right">Total</th><th>Prevista</th><th>Estado</th><th></th></tr></THead>
          <TBody>
            {(pos ?? []).map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.po_number}</td>
                <td className="text-ink-muted">{p.suppliers?.name ?? '—'}</td>
                <td className="tabular">{(p.purchase_order_items ?? []).length}</td>
                <td className="text-right tabular font-medium">{formatKz(p.total)}</td>
                <td className="text-xs text-ink-muted">{p.expected_date ? formatDate(p.expected_date) : '—'}</td>
                <td><StatusBadge map={PO_STATUS} value={p.status} /></td>
                <td><PoActions po={p} /></td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!pos?.length && <EmptyState compact title="Sem ordens de compra" description="Cria uma encomenda a fornecedor para repor stock (em desenvolvimento)." />}
      </Card>
      <Card className="mt-6">
        <Table>
          <THead><tr><th>Pedido</th><th>Produto</th><th>Motivo</th><th>Reembolso</th><th>Estado</th><th>Data</th></tr></THead>
          <TBody>
            {(returns ?? []).map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.orders?.order_number ?? '—'}</td>
                <td>{r.products?.name ?? '—'} ×{r.quantity}</td>
                <td className="max-w-56 truncate text-xs text-ink-muted">{r.reason}</td>
                <td className="tabular">{r.refund_amount ? formatKz(r.refund_amount) : '—'}</td>
                <td><StatusBadge map={RETURN_STATUS} value={r.status} /></td>
                <td className="text-xs text-ink-muted">{formatDateTime(r.created_at)}</td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!returns?.length && <EmptyState compact title="Sem devoluções" />}
      </Card>
    </>
  )
}

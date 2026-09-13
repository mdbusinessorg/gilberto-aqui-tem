import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, StatusBadge, EmptyState, Input, Button } from '@/components/ui'
import { formatKz, formatDate } from '@/lib/utils'
import { TIER } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function CustomersPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient()
  let q = supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(150)
  if (searchParams.q) {
    const t = searchParams.q.replace(/[%_,()]/g, ' ')
    q = q.or(`name.ilike.%${t}%,phone.ilike.%${t}%,email.ilike.%${t}%`)
  }
  const { data: customers } = await q
  return (
    <>
      <PageHeader title="Clientes" description={`${customers?.length ?? 0} clientes`} />
      <Card>
        <form className="flex gap-3 border-b border-line p-4">
          <div className="min-w-48 flex-1"><Input name="q" placeholder="Nome, telefone ou email" defaultValue={searchParams.q} /></div>
          <Button type="submit" variant="outline">Procurar</Button>
        </form>
        <Table>
          <THead><tr><th>Cliente</th><th>Contacto</th><th>Pedidos</th><th className="text-right">Total gasto</th><th>Pontos</th><th>Nível</th><th>Última compra</th></tr></THead>
          <TBody>
            {(customers ?? []).map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td><p className="text-sm">{c.phone}</p><p className="text-xs text-ink-muted">{c.email ?? '—'}</p></td>
                <td className="tabular">{c.orders_count}</td>
                <td className="text-right tabular font-medium">{formatKz(c.total_spent)}</td>
                <td className="tabular">{c.loyalty_points}</td>
                <td><StatusBadge map={TIER} value={c.tier} /></td>
                <td className="text-xs text-ink-muted">{c.last_order_at ? formatDate(c.last_order_at) : '—'}</td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!customers?.length && <EmptyState compact title="Sem clientes" />}
      </Card>
    </>
  )
}

import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, StatusBadge, EmptyState } from '@/components/ui'
import { formatKz, formatDateTime } from '@/lib/utils'
import { TRADE_STATUS } from '@/lib/labels'
import { TradeActions } from './actions'

export const dynamic = 'force-dynamic'

export default async function TradesPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient()
  let q = supabase.from('trade_requests').select('*').order('created_at', { ascending: false }).limit(100)
  if (searchParams.estado) q = q.eq('status', searchParams.estado as never)
  const { data: trades } = await q
  return (
    <>
      <PageHeader title="Trocas & Compras de usados" description={`${trades?.length ?? 0} pedidos de avaliação`} />
      <Card>
        <Table>
          <THead><tr><th>Cliente</th><th>Aparelho</th><th>Estado físico</th><th>Bateria</th><th>Esperado</th><th>Oferta</th><th>Estado</th><th>Data</th><th></th></tr></THead>
          <TBody>
            {(trades ?? []).map((t) => (
              <tr key={t.id}>
                <td><p className="font-medium">{t.name}</p><p className="text-xs text-ink-muted">{t.phone}</p></td>
                <td>{t.brand} {t.model}{t.storage ? ` · ${t.storage}` : ''}{t.photos.length > 0 && <p className="text-xs text-ink-muted">{t.photos.length} fotografia(s)</p>}</td>
                <td className="text-xs text-ink-muted">{t.condition ?? '—'}{t.accessories ? ` · ${t.accessories}` : ''}</td>
                <td className="tabular">{t.battery_health != null ? `${t.battery_health}%` : '—'}</td>
                <td className="tabular text-ink-muted">{t.expected_value ? formatKz(t.expected_value) : '—'}</td>
                <td className="tabular font-medium">{t.final_offer ? formatKz(t.final_offer) : t.estimated_value ? `~${formatKz(t.estimated_value)}` : '—'}</td>
                <td><StatusBadge map={TRADE_STATUS} value={t.status} /></td>
                <td className="text-xs text-ink-muted">{formatDateTime(t.created_at)}</td>
                <td><TradeActions trade={t} /></td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!trades?.length && <EmptyState compact title="Sem pedidos de troca" />}
      </Card>
    </>
  )
}

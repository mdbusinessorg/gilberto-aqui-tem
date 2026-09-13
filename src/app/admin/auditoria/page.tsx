import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, EmptyState, Input, Button } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AuditPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient()
  let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(150)
  if (searchParams.q) q = q.or(`user_name.ilike.%${searchParams.q}%,entity.ilike.%${searchParams.q}%,action.ilike.%${searchParams.q}%`)
  const { data: logs } = await q
  return (
    <>
      <PageHeader title="Auditoria" description="Registo de todas as acções sensíveis no sistema." />
      <Card>
        <form className="flex gap-3 border-b border-line p-4">
          <div className="min-w-48 flex-1"><Input name="q" placeholder="Utilizador, entidade ou acção" defaultValue={searchParams.q} /></div>
          <Button type="submit" variant="outline">Procurar</Button>
        </form>
        <Table>
          <THead><tr><th>Quando</th><th>Utilizador</th><th>Acção</th><th>Entidade</th><th>Detalhes</th></tr></THead>
          <TBody>
            {(logs ?? []).map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap text-xs text-ink-muted">{formatDateTime(l.created_at)}</td>
                <td className="font-medium">{l.user_name ?? 'Sistema'}</td>
                <td className="text-sm">{l.action}</td>
                <td className="text-xs text-ink-muted">{l.entity}{l.entity_id ? ` · ${String(l.entity_id).slice(0, 8)}` : ''}</td>
                <td className="max-w-64"><code className="block truncate text-[11px] text-ink-muted">{JSON.stringify(l.new_data ?? l.old_data ?? {})}</code></td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!logs?.length && <EmptyState compact title="Sem registos" />}
      </Card>
    </>
  )
}

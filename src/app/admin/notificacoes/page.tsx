import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient, getSessionProfile } from '@/lib/supabase/server'
import { PageHeader, Card, EmptyState, Badge } from '@/components/ui'
import { timeAgo } from '@/lib/utils'
import { NOTIFICATION_KINDS } from '@/lib/labels'
import { MarkAllRead } from './mark-read'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = createClient()
  const { user, profile } = await getSessionProfile()
  const [{ data: notifications }, { data: reads }] = await Promise.all([
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(80),
    user ? supabase.from('notification_reads').select('notification_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
  ])
  const readSet = new Set((reads ?? []).map((r) => r.notification_id))
  const tones: Record<string, 'blue' | 'amber' | 'red' | 'green'> = { normal: 'blue', alta: 'amber', urgente: 'red', baixa: 'green' }
  return (
    <>
      <PageHeader title="Notificações" description="Alertas do sistema para a equipa." actions={<MarkAllRead ids={(notifications ?? []).filter((n) => !readSet.has(n.id)).map((n) => n.id)} />} />
      <Card>
        {!notifications?.length ? <EmptyState compact icon={<Bell className="h-5 w-5" />} title="Sem notificações" /> : (
          <ul className="divide-y divide-line">
            {notifications.map((n) => (
              <li key={n.id} className={`px-5 py-3.5 ${readSet.has(n.id) ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <Badge tone={tones[n.priority] ?? 'blue'} className="mt-0.5">{NOTIFICATION_KINDS[n.kind] ?? n.kind}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-xs text-ink-muted">{n.body}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    {n.link && <Link href={n.link} className="font-medium text-brand-700">Abrir</Link>}
                    {timeAgo(n.created_at)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}

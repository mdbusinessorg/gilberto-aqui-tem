import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, StatusBadge, EmptyState, Progress } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { WORK_STATUS, PRIORITY } from '@/lib/labels'
import { TaskForm, TaskStatusSelect } from './form'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const supabase = createClient()
  const [{ data: tasks }, { data: employees }] = await Promise.all([
    supabase.from('tasks').select('*, employees(full_name)').order('created_at', { ascending: false }).limit(100),
    supabase.from('employees').select('id,full_name').eq('status', 'activo').order('full_name'),
  ])
  return (
    <>
      <PageHeader title="Tarefas & Objectivos" description={`${(tasks ?? []).filter((t) => t.status !== 'concluida').length} em aberto`} actions={<TaskForm employees={employees ?? []} />} />
      <Card>
        <Table>
          <THead><tr><th>Tarefa</th><th>Responsável</th><th>Prazo</th><th>Prioridade</th><th>Progresso</th><th>Estado</th></tr></THead>
          <TBody>
            {(tasks ?? []).map((t) => (
              <tr key={t.id}>
                <td><p className="font-medium">{t.title}</p>{t.description && <p className="max-w-80 truncate text-xs text-ink-muted">{t.description}</p>}</td>
                <td className="text-ink-muted">{t.employees?.full_name ?? '—'}</td>
                <td className="text-xs text-ink-muted">{t.deadline ? formatDate(t.deadline) : '—'}</td>
                <td><StatusBadge map={PRIORITY} value={t.priority} /></td>
                <td><div className="flex w-28 items-center gap-2"><Progress value={t.progress} /><span className="text-xs tabular">{t.progress}%</span></div></td>
                <td><TaskStatusSelect task={t} /></td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!tasks?.length && <EmptyState compact title="Sem tarefas" description="Cria a primeira tarefa ou objectivo para a equipa." />}
      </Card>
    </>
  )
}

import { createClient, getSessionProfile } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, StatusBadge, EmptyState } from '@/components/ui'
import { formatTime, minutesToHours, todayISO } from '@/lib/utils'
import { ATTENDANCE_STATUS } from '@/lib/labels'
import { ClockCamera } from '@/components/admin/clock-camera'
import { isManagerRole } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function AttendancePage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient()
  const { user, profile } = await getSessionProfile()
  const manager = !!profile && isManagerRole(profile.role)
  const day = searchParams.dia ?? todayISO()
  const [{ data: attendance }, { data: myEmployee }, { data: employees }] = await Promise.all([
    supabase.from('attendance').select('*, employees(full_name, department, schedule_start)').eq('work_date', manager ? day : todayISO()).order('check_in'),
    user ? supabase.from('employees').select('id,full_name').eq('profile_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('employees').select('id,full_name').eq('status', 'activo').order('full_name'),
  ])
  const present = (attendance ?? []).filter((a) => a.check_in).length
  const late = (attendance ?? []).filter((a) => a.status === 'atrasado').length
  const mine = myEmployee ? (attendance ?? []).find((a) => a.employee_id === myEmployee.id) : null

  return (
    <>
      <PageHeader title="Pontualidade" description={day === todayISO() ? 'Hoje' : day}
        actions={<div className="flex items-center gap-2"><form><input type="date" name="dia" defaultValue={day} className="h-10 rounded-md border border-line px-3 text-sm" /></form>{myEmployee && <ClockCamera employeeId={myEmployee.id} today={mine} compact />}</div>} />
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-xs text-ink-muted">Presentes</p><p className="mt-1 text-2xl font-semibold tabular">{present}<span className="text-sm font-normal text-ink-muted">/{employees?.length ?? 0}</span></p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Atrasados</p><p className="mt-1 text-2xl font-semibold tabular text-amber-600">{late}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Ausentes</p><p className="mt-1 text-2xl font-semibold tabular text-red-600">{Math.max(0, (employees?.length ?? 0) - present)}</p></Card>
      </div>
      <Card>
        <Table>
          <THead><tr><th>Funcionário</th><th>Departamento</th><th>Entrada</th><th>Saída</th><th>Atraso</th><th>Horas</th><th>Estado</th><th>Foto</th></tr></THead>
          <TBody>
            {(attendance ?? []).map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.employees?.full_name}</td>
                <td className="text-ink-muted">{a.employees?.department}</td>
                <td className="tabular">{a.check_in ? formatTime(a.check_in) : '—'}</td>
                <td className="tabular">{a.check_out ? formatTime(a.check_out) : '—'}</td>
                <td className="tabular">{a.late_minutes > 0 ? <span className="text-amber-600">+{a.late_minutes}min</span> : '—'}</td>
                <td className="tabular">{a.worked_minutes > 0 ? minutesToHours(a.worked_minutes) : '—'}</td>
                <td><StatusBadge map={ATTENDANCE_STATUS} value={a.status} /></td>
                <td>{a.check_in_photo ? <a href={a.check_in_photo} target="_blank" rel="noopener"><img src={a.check_in_photo} alt="" className="h-9 w-9 rounded-md object-cover" /></a> : <span className="text-ink-muted">—</span>}</td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!attendance?.length && <EmptyState compact title="Sem registos neste dia" description="Os funcionários fazem check-in nesta página." />}
      </Card>
      <p className="mt-4 text-xs text-ink-muted">Os dados de pontualidade servem para gestão e relatórios — não aplicam penalizações automáticas.</p>
    </>
  )
}

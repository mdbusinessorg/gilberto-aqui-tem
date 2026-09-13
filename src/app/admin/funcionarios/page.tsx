import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Table, THead, TBody, Badge, EmptyState } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { DEPARTMENTS } from '@/lib/labels'
import { EmployeeForm } from './form'
import { RoleManager } from './roles'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const supabase = createClient()
  const { data: employees } = await supabase.from('employees').select('*, profiles(email, role)').order('full_name')
  return (
    <>
      <PageHeader title="Funcionários" description={`${employees?.length ?? 0} registos`} actions={<EmployeeForm />} />
      <Card>
        <Table>
          <THead><tr><th>Nome</th><th>Código</th><th>Departamento</th><th>Cargo</th><th>Contacto</th><th>Horário</th><th>Estado</th><th>Admissão</th><th></th></tr></THead>
          <TBody>
            {(employees ?? []).map((e) => (
              <tr key={e.id}>
                <td><p className="font-medium">{e.full_name}</p>{e.profiles?.email && <p className="text-xs text-ink-muted">{e.profiles.email}</p>}</td>
                <td className="text-xs text-ink-muted">{e.employee_code ?? '—'}</td>
                <td>{e.department}</td>
                <td className="text-ink-muted">{e.position ?? '—'}</td>
                <td className="text-sm">{e.phone ?? '—'}</td>
                <td className="text-xs text-ink-muted">{String(e.schedule_start).slice(0, 5)}–{String(e.schedule_end).slice(0, 5)}</td>
                <td><Badge tone={e.status === 'activo' ? 'green' : 'neutral'}>{e.status === 'activo' ? 'Activo' : e.status}</Badge></td>
                <td className="text-xs text-ink-muted">{e.hire_date ? formatDate(e.hire_date) : '—'}</td>
                <td><div className="flex items-center justify-end gap-1"><RoleManager employeeId={e.id} profileId={e.profile_id} currentRole={e.profiles?.role} /><EmployeeForm employee={e} /></div></td>
              </tr>
            ))}
          </TBody>
        </Table>
        {!employees?.length && <EmptyState compact title="Sem funcionários" description="Regista a equipa para controlar pontualidade e desempenho." />}
      </Card>
    </>
  )
}

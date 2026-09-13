'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button, Modal, Field, Input, Select, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { DEPARTMENTS } from '@/lib/labels'
import type { Database } from '@/lib/supabase/database.types'

type Employee = Database['public']['Tables']['employees']['Row']

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const [f, setF] = React.useState({
    full_name: employee?.full_name ?? '', department: employee?.department ?? 'Vendas', position: employee?.position ?? '',
    phone: employee?.phone ?? '', email: employee?.email ?? '', hire_date: employee?.hire_date ?? '',
    schedule_start: employee?.schedule_start?.slice(0, 5) ?? '08:30', schedule_end: employee?.schedule_end?.slice(0, 5) ?? '18:00',
    status: employee?.status ?? 'activo', notes: employee?.notes ?? '',
  })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.full_name.trim()) { toast.error('Nome obrigatório'); return }
    setLoading(true)
    const supabase = createClient()
    const row = { full_name: f.full_name.trim(), department: f.department, position: f.position || null, phone: f.phone || null, email: f.email || null, hire_date: f.hire_date || null, schedule_start: f.schedule_start, schedule_end: f.schedule_end, status: f.status, notes: f.notes || null }
    const { error } = employee
      ? await supabase.from('employees').update(row as never).eq('id', employee.id)
      : await supabase.from('employees').insert(row as never)
    setLoading(false)
    if (error) toast.error('Erro', error.message)
    else { toast.success(employee ? 'Funcionário actualizado' : 'Funcionário registado'); setOpen(false); router.refresh() }
  }

  return (
    <>
      {employee ? <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Editar</Button> : <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo funcionário</Button>}
      <Modal open={open} onClose={() => setOpen(false)} title={employee ? 'Editar funcionário' : 'Novo funcionário'}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" required className="sm:col-span-2"><Input value={f.full_name} onChange={(e) => set('full_name', e.target.value)} required /></Field>
          <Field label="Departamento"><Select value={f.department} onChange={(e) => set('department', e.target.value)}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</Select></Field>
          <Field label="Cargo"><Input value={f.position} onChange={(e) => set('position', e.target.value)} /></Field>
          <Field label="Telefone"><Input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
          <Field label="Admissão"><Input type="date" value={f.hire_date} onChange={(e) => set('hire_date', e.target.value)} /></Field>
          <Field label="Estado"><Select value={f.status} onChange={(e) => set('status', e.target.value)}><option value="activo">Activo</option><option value="suspenso">Suspenso</option><option value="inactivo">Inactivo</option></Select></Field>
          <Field label="Entrada"><Input type="time" value={f.schedule_start} onChange={(e) => set('schedule_start', e.target.value)} /></Field>
          <Field label="Saída"><Input type="time" value={f.schedule_end} onChange={(e) => set('schedule_end', e.target.value)} /></Field>
          <Field label="Notas internas" className="sm:col-span-2"><Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading}>Guardar</Button></div>
        </form>
      </Modal>
    </>
  )
}

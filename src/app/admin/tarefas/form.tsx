'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button, Modal, Field, Input, Select, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { WORK_STATUS, PRIORITY } from '@/lib/labels'
import type { WorkStatus } from '@/lib/labels'
import type { Database } from '@/lib/supabase/database.types'

type Task = Database['public']['Tables']['tasks']['Row']

export function TaskForm({ employees }: { employees: { id: string; full_name: string }[] }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const [f, setF] = React.useState({ title: '', description: '', employee_id: '', deadline: '', priority: 'media', notes: '' })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('tasks').insert({ title: f.title, description: f.description || null, employee_id: f.employee_id || null, deadline: f.deadline || null, priority: f.priority, notes: f.notes || null } as never)
    setLoading(false)
    if (error) toast.error('Erro', error.message)
    else { toast.success('Tarefa criada'); setOpen(false); router.refresh() }
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nova tarefa</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nova tarefa / objectivo">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Título" required><Input value={f.title} onChange={(e) => set('title', e.target.value)} required /></Field>
          <Field label="Descrição"><Textarea value={f.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Responsável"><Select value={f.employee_id} onChange={(e) => set('employee_id', e.target.value)}><option value="">—</option>{employees.map((e2) => <option key={e2.id} value={e2.id}>{e2.full_name}</option>)}</Select></Field>
            <Field label="Prazo"><Input type="date" value={f.deadline} onChange={(e) => set('deadline', e.target.value)} /></Field>
            <Field label="Prioridade"><Select value={f.priority} onChange={(e) => set('priority', e.target.value)}>{Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</Select></Field>
          </div>
          <Field label="Notas"><Input value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading}>Criar</Button></div>
        </form>
      </Modal>
    </>
  )
}

export function TaskStatusSelect({ task }: { task: Task }) {
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const update = async (status: string) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('tasks').update({ status, progress: status === 'concluida' ? 100 : task.progress, completed_at: status === 'concluida' ? new Date().toISOString() : null } as never).eq('id', task.id)
    setLoading(false)
    if (error) toast.error('Erro', error.message); else router.refresh()
  }
  return (
    <Select value={task.status} disabled={loading} onChange={(e) => update(e.target.value)} className="h-8 w-40 text-xs">
      {Object.entries(WORK_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
    </Select>
  )
}

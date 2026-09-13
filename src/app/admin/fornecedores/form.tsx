'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button, Modal, Field, Input, Textarea, Checkbox } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Supplier = Database['public']['Tables']['suppliers']['Row']

export function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const [f, setF] = React.useState({
    name: supplier?.name ?? '', contact_name: supplier?.contact_name ?? '', phone: supplier?.phone ?? '',
    email: supplier?.email ?? '', location: supplier?.location ?? '', products_supplied: supplier?.products_supplied ?? '',
    notes: supplier?.notes ?? '', is_active: supplier?.is_active ?? true,
  })
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = supplier
      ? await supabase.from('suppliers').update(f as never).eq('id', supplier.id)
      : await supabase.from('suppliers').insert(f as never)
    setLoading(false)
    if (error) toast.error('Erro', error.message)
    else { toast.success('Guardado'); setOpen(false); router.refresh() }
  }
  return (
    <>
      {supplier ? <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Editar</Button> : <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo fornecedor</Button>}
      <Modal open={open} onClose={() => setOpen(false)} title={supplier ? 'Editar fornecedor' : 'Novo fornecedor'}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" required className="sm:col-span-2"><Input value={f.name} onChange={(e) => set('name', e.target.value)} required /></Field>
          <Field label="Pessoa de contacto"><Input value={f.contact_name} onChange={(e) => set('contact_name', e.target.value)} /></Field>
          <Field label="Telefone"><Input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
          <Field label="Localização"><Input value={f.location} onChange={(e) => set('location', e.target.value)} /></Field>
          <Field label="Produtos fornecidos" className="sm:col-span-2"><Input value={f.products_supplied} onChange={(e) => set('products_supplied', e.target.value)} placeholder="Telemóveis, acessórios…" /></Field>
          <Field label="Notas" className="sm:col-span-2"><Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
          <Checkbox label="Activo" checked={f.is_active} onChange={(e) => set('is_active', e.target.checked)} />
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading}>Guardar</Button></div>
        </form>
      </Modal>
    </>
  )
}

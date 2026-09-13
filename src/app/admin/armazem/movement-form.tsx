'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button, Modal, Field, Input, Select, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { MOVEMENT_TYPES } from '@/lib/labels'

export function MovementForm({ products, locations }: { products: { id: string; name: string; sku: string }[]; locations: { id: string; name: string }[] }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const [f, setF] = React.useState({ product_id: '', type: 'entrada', quantity: '1', location_id: '', reason: '', notes: '' })
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.product_id) { toast.error('Escolhe o produto'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.rpc('staff_apply_movement', {
      p_product_id: f.product_id, p_type: f.type, p_quantity: Number(f.quantity || 1),
      p_location_id: f.location_id || null, p_reason: f.reason || null, p_notes: f.notes || null,
    } as never)
    setLoading(false)
    if (error) toast.error('Erro', error.message)
    else { toast.success('Movimento registado'); setOpen(false); router.refresh() }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo movimento</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Registar movimento de inventário">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Produto" required>
            <Select value={f.product_id} onChange={(e) => set('product_id', e.target.value)} required>
              <option value="">Escolher…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo" required>
              <Select value={f.type} onChange={(e) => set('type', e.target.value)}>
                {Object.entries(MOVEMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </Field>
            <Field label="Quantidade" required><Input type="number" min={1} value={f.quantity} onChange={(e) => set('quantity', e.target.value)} required /></Field>
          </div>
          <Field label="Localização">
            <Select value={f.location_id} onChange={(e) => set('location_id', e.target.value)}>
              <option value="">—</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>
          <Field label="Motivo"><Input value={f.reason} onChange={(e) => set('reason', e.target.value)} placeholder="Ex.: reposição, avaria…" /></Field>
          <Field label="Notas"><Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading}>Registar</Button></div>
        </form>
      </Modal>
    </>
  )
}

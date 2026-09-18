'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button, Modal, Field, Input, Select, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { MOVEMENT_TYPES } from '@/lib/labels'

export function MovementForm({ products, locations, inventory, defaultLocationId = '' }: { products: { id: string; name: string; sku: string }[]; locations: { id: string; name: string }[]; inventory: { product_id: string; location_id: string; quantity: number }[]; defaultLocationId?: string }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const initialForm = { product_id: '', type: 'entrada', quantity: '1', location_id: defaultLocationId, to_location_id: '', reason: '', notes: '' }
  const [f, setF] = React.useState(initialForm)
  const currentStock = inventory.find((i) => i.product_id === f.product_id && i.location_id === f.location_id)?.quantity ?? 0
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!f.product_id) { toast.error('Escolhe o produto'); return }
    if (!f.location_id) { toast.error('Escolhe a localização'); return }
    if (!Number.isInteger(Number(f.quantity)) || Number(f.quantity) < 1) { toast.error('A quantidade deve ser um número inteiro positivo'); return }
    if (f.type === 'transferencia' && (!f.to_location_id || f.to_location_id === f.location_id)) { toast.error('Escolhe um destino diferente da origem'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('staff_apply_movement', {
        p_product_id: f.product_id, p_type: f.type, p_quantity: Number(f.quantity),
        p_location_id: f.location_id, p_to_location_id: f.type === 'transferencia' ? f.to_location_id : null,
        p_reason: f.reason.trim() || null, p_notes: f.notes || null,
      } as never)
      if (error) { toast.error('Erro', error.message); return }
      toast.success('Movimento registado')
      setOpen(false)
      setF(initialForm)
      router.refresh()
    } catch {
      toast.error('Erro', 'Não foi possível registar o movimento. Verifica a ligação à internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo movimento</Button>
      <Modal open={open} onClose={() => { if (!loading) setOpen(false) }} title="Registar movimento de inventário">
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
            <Field label={f.type === 'ajuste' ? 'Quantidade contada' : 'Quantidade'} required><Input type="number" min={1} step={1} value={f.quantity} onChange={(e) => set('quantity', e.target.value)} required /></Field>
          </div>
          <Field label={f.type === 'transferencia' ? 'Localização de origem' : 'Localização'} required>
            <Select value={f.location_id} onChange={(e) => set('location_id', e.target.value)} required>
              <option value="">Escolher localização…</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>
          {f.type === 'transferencia' && <Field label="Localização de destino" required>
            <Select value={f.to_location_id} onChange={(e) => set('to_location_id', e.target.value)} required>
              <option value="">Escolher destino…</option>
              {locations.filter((l) => l.id !== f.location_id).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </Field>}
          {f.product_id && f.location_id && <p className="text-sm text-ink-muted">Saldo registado neste local: <strong>{currentStock} unidades</strong>.</p>}
          {f.type === 'ajuste' && <p className="text-xs text-ink-muted">O ajuste substitui o saldo pela quantidade contada. Para zerar o saldo, regista uma saída de todas as unidades.</p>}
          <Field label="Motivo" required><Input value={f.reason} onChange={(e) => set('reason', e.target.value)} required placeholder="Ex.: recepção de mercadoria, venda física, contagem…" /></Field>
          <Field label="Notas"><Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading}>Registar</Button></div>
        </form>
      </Modal>
    </>
  )
}

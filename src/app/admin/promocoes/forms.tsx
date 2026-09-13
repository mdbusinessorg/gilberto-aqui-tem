'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button, Modal, Field, Input, Select } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

export function CouponForm() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const [f, setF] = React.useState({ code: '', type: 'percentual', value: '', min: '', max_uses: '', expires: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('coupons').insert({
      code: f.code.toUpperCase().trim(), discount_type: f.type, discount_value: Number(f.value),
      min_order: f.min ? Number(f.min) : 0, max_uses: f.max_uses ? Number(f.max_uses) : null,
      expires_at: f.expires ? new Date(f.expires).toISOString() : null,
    } as never)
    setLoading(false)
    if (error) toast.error('Erro', error.message); else { toast.success('Cupão criado'); setOpen(false); router.refresh() }
  }
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Cupão</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Novo cupão">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Código" required><Input value={f.code} onChange={(e) => setF((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="EX: BEMVINDO10" required /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo"><Select value={f.type} onChange={(e) => setF((p) => ({ ...p, type: e.target.value }))}><option value="percentual">Percentual (%)</option><option value="fixo">Valor fixo (Kz)</option></Select></Field>
            <Field label="Valor" required><Input type="number" min={0} value={f.value} onChange={(e) => setF((p) => ({ ...p, value: e.target.value }))} required /></Field>
            <Field label="Pedido mínimo (Kz)"><Input type="number" min={0} value={f.min} onChange={(e) => setF((p) => ({ ...p, min: e.target.value }))} /></Field>
            <Field label="Máx. utilizações"><Input type="number" min={1} value={f.max_uses} onChange={(e) => setF((p) => ({ ...p, max_uses: e.target.value }))} /></Field>
            <Field label="Expira em"><Input type="date" value={f.expires} onChange={(e) => setF((p) => ({ ...p, expires: e.target.value }))} /></Field>
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading}>Criar</Button></div>
        </form>
      </Modal>
    </>
  )
}

export function BannerForm() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const [f, setF] = React.useState({ title: '', subtitle: '', image_url: '', link_url: '', cta_label: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('banners').insert({ title: f.title, subtitle: f.subtitle || null, image_url: f.image_url || null, link_url: f.link_url || null, cta_label: f.cta_label || null } as never)
    setLoading(false)
    if (error) toast.error('Erro', error.message); else { toast.success('Banner criado'); setOpen(false); router.refresh() }
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Banner</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Novo banner">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Título" required><Input value={f.title} onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} required /></Field>
          <Field label="Subtítulo"><Input value={f.subtitle} onChange={(e) => setF((p) => ({ ...p, subtitle: e.target.value }))} /></Field>
          <Field label="URL da imagem"><Input value={f.image_url} onChange={(e) => setF((p) => ({ ...p, image_url: e.target.value }))} /></Field>
          <Field label="Link"><Input value={f.link_url} onChange={(e) => setF((p) => ({ ...p, link_url: e.target.value }))} placeholder="/loja?promo=1" /></Field>
          <Field label="Texto do botão"><Input value={f.cta_label} onChange={(e) => setF((p) => ({ ...p, cta_label: e.target.value }))} placeholder="Ver mais" /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading}>Criar</Button></div>
        </form>
      </Modal>
    </>
  )
}

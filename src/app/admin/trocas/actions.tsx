'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Modal, Field, Input, Select, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { TRADE_STATUS } from '@/lib/labels'
import type { TradeStatus } from '@/lib/labels'
import type { Database } from '@/lib/supabase/database.types'
import { PhotoUpload } from '@/components/ui/photo-upload'

type Trade = Database['public']['Tables']['trade_requests']['Row']

export function TradeActions({ trade }: { trade: Trade }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [photos, setPhotos] = React.useState(trade.photos)
  const [uploading, setUploading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const [f, setF] = React.useState({
    status: trade.status, estimated: trade.estimated_value?.toString() ?? '', offer: trade.final_offer?.toString() ?? '',
    inspection: trade.inspection_result ?? '',
  })

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || uploading) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('trade_requests').update({
        status: f.status, estimated_value: f.estimated ? Number(f.estimated) : null,
        final_offer: f.offer ? Number(f.offer) : null, inspection_result: f.inspection || null, photos,
      }).eq('id', trade.id).select('id').single()
      if (error) { toast.error('Erro', error.message); return }
      toast.success('Avaliação guardada')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Erro ao guardar', 'Verifica a ligação à internet e tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Ver / avaliar</Button>
      <Modal open={open} onClose={() => { if (!loading && !uploading) setOpen(false) }} title={`${trade.brand} ${trade.model} — ${trade.name}`} description={trade.notes ?? undefined}>
        <form onSubmit={save} className="space-y-4">
          <PhotoUpload bucket="trade-ins" photos={photos} onChange={setPhotos}
            uploading={uploading} onUploadingChange={setUploading} disabled={loading} />
          <Field label="Estado" required>
            <Select value={f.status} onChange={(e) => setF((p) => ({ ...p, status: e.target.value as TradeStatus }))}>
              {Object.entries(TRADE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor estimado (Kz)"><Input type="number" min={0} value={f.estimated} onChange={(e) => setF((p) => ({ ...p, estimated: e.target.value }))} /></Field>
            <Field label="Oferta final (Kz)"><Input type="number" min={0} value={f.offer} onChange={(e) => setF((p) => ({ ...p, offer: e.target.value }))} /></Field>
          </div>
          <Field label="Resultado da inspecção"><Textarea value={f.inspection} onChange={(e) => setF((p) => ({ ...p, inspection: e.target.value }))} placeholder="Estado técnico observado…" /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={loading || uploading} onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading || uploading}>Guardar</Button></div>
        </form>
      </Modal>
    </>
  )
}

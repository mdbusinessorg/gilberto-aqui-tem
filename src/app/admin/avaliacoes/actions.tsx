'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Modal, Field, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Review = Database['public']['Tables']['reviews']['Row']

export function ReviewActions({ review }: { review: Review }) {
  const [open, setOpen] = React.useState(false)
  const [response, setResponse] = React.useState(review.admin_response ?? '')
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()

  const update = async (patch: Record<string, unknown>, okMsg: string) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').update(patch as never).eq('id', review.id)
    setLoading(false)
    if (error) toast.error('Erro', error.message); else { toast.success(okMsg); setOpen(false); router.refresh() }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {review.status !== 'aprovada' && <Button size="sm" loading={loading} onClick={() => update({ status: 'aprovada' }, 'Avaliação aprovada')}>Aprovar</Button>}
      {review.status !== 'rejeitada' && review.status !== 'aprovada' && <Button size="sm" variant="danger" loading={loading} onClick={() => update({ status: 'rejeitada' }, 'Avaliação rejeitada')}>Rejeitar</Button>}
      {review.status === 'aprovada' && <Button size="sm" variant="outline" loading={loading} onClick={() => update({ status: 'oculta' }, 'Avaliação ocultada')}>Ocultar</Button>}
      {!review.is_featured && review.status === 'aprovada' && <Button size="sm" variant="outline" loading={loading} onClick={() => update({ is_featured: true }, 'Destacada')}>Destacar</Button>}
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Responder</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Responder à avaliação">
        <form onSubmit={(e) => { e.preventDefault(); update({ admin_response: response, responded_at: new Date().toISOString() }, 'Resposta publicada') }} className="space-y-4">
          <Field label="Resposta pública"><Textarea value={response} onChange={(e) => setResponse(e.target.value)} /></Field>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={loading}>Publicar</Button></div>
        </form>
      </Modal>
    </div>
  )
}

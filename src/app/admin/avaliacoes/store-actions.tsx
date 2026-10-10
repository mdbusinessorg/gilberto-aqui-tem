'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'

export function StoreReviewActions({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()

  const set = async (status: 'aprovada' | 'rejeitada' | 'oculta', msg: string) => {
    setLoading(true)
    const res = await fetch('/api/avaliar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setLoading(false)
    if (!res.ok) toast.error('Erro ao moderar'); else { toast.success(msg); router.refresh() }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {status !== 'aprovada' && <Button size="sm" loading={loading} onClick={() => set('aprovada', 'Avaliação aprovada — já aparece na loja')}>Aprovar</Button>}
      {status === 'pendente' && <Button size="sm" variant="danger" loading={loading} onClick={() => set('rejeitada', 'Avaliação rejeitada')}>Rejeitar</Button>}
      {status === 'aprovada' && <Button size="sm" variant="outline" loading={loading} onClick={() => set('oculta', 'Avaliação ocultada')}>Ocultar</Button>}
    </div>
  )
}

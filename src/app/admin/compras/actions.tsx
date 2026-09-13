'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { PO_STATUS } from '@/lib/labels'
import type { PoStatus } from '@/lib/labels'
import type { Database } from '@/lib/supabase/database.types'

type Po = Database['public']['Tables']['purchase_orders']['Row']

export function PoActions({ po }: { po: Po }) {
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const setStatus = async (status: PoStatus) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('purchase_orders').update({ status } as never).eq('id', po.id)
    setLoading(false)
    if (error) toast.error('Erro', error.message); else { toast.success('Actualizado'); router.refresh() }
  }
  const receive = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.rpc('receive_purchase_order', { p_po_id: po.id, p_items: null } as never)
    setLoading(false)
    if (error) toast.error('Erro ao receber', error.message); else { toast.success('Recepção processada — stock actualizado'); router.refresh() }
  }
  return (
    <div className="flex justify-end gap-1">
      {po.status === 'rascunho' && <Button size="sm" variant="outline" loading={loading} onClick={() => setStatus('encomendado')}>Encomendar</Button>}
      {(po.status === 'encomendado' || po.status === 'parcialmente_recebido') && <Button size="sm" loading={loading} onClick={receive}>Receber</Button>}
      {po.status !== 'recebido' && po.status !== 'cancelado' && <Button size="sm" variant="ghost" loading={loading} onClick={() => setStatus('cancelado')}>Cancelar</Button>}
    </div>
  )
}

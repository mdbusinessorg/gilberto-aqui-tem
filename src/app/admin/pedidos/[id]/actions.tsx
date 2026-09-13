'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Select, Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/labels'
import type { OrderStatus, PaymentStatus } from '@/lib/labels'
import type { Database } from '@/lib/supabase/database.types'

type Order = Database['public']['Tables']['orders']['Row']

export function OrderActions({ order }: { order: Order }) {
  const [status, setStatus] = React.useState<OrderStatus>(order.status)
  const [pay, setPay] = React.useState<PaymentStatus>(order.payment_status)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()

  const save = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status, payment_status: pay } as never).eq('id', order.id)
    setLoading(false)
    if (error) toast.error('Erro ao actualizar', error.message)
    else { toast.success('Pedido actualizado'); router.refresh() }
  }
  return (
    <div className="flex items-end gap-2">
      <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="w-44">
        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </Select>
      <Select value={pay} onChange={(e) => setPay(e.target.value as PaymentStatus)} className="w-40">
        {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </Select>
      <Button onClick={save} loading={loading} disabled={status === order.status && pay === order.payment_status}>Guardar</Button>
    </div>
  )
}

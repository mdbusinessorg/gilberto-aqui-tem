'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Undo2 } from 'lucide-react'
import { Select, Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/lib/labels'
import type { OrderStatus, PaymentStatus } from '@/lib/labels'
import type { Database } from '@/lib/supabase/database.types'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: { product_name: string; quantity: number; unit_price: number }[]
}

const SOLD: OrderStatus[] = ['entregue', 'concluido', 'pago']

export function OrderActions({ order }: { order: Order }) {
  const [status, setStatus] = React.useState<OrderStatus>(order.status)
  const [pay, setPay] = React.useState<PaymentStatus>(order.payment_status)
  const [loading, setLoading] = React.useState(false)
  const toast = useToast()
  const router = useRouter()
  const sold = SOLD.includes(order.status) && order.payment_status === 'pago'

  const notifyDelivered = () => {
    if (!order.customer_email) return
    void fetch('/api/email/encomenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'entregue',
        to: order.customer_email,
        name: order.customer_name,
        number: order.order_number,
        total: order.total,
        phone: order.customer_phone,
        delivery: order.delivery_method,
        address: order.delivery_address,
        payment: order.payment_method,
        items: (order.order_items ?? []).map((i) => ({ name: i.product_name, qty: i.quantity, price: i.unit_price })),
      }),
    }).catch(() => {})
  }

  const update = async (next: { status: OrderStatus; payment_status: PaymentStatus }, msg: string) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('orders').update(next as never).eq('id', order.id)
    setLoading(false)
    if (error) { toast.error('Erro ao actualizar', error.message); return }
    toast.success(msg)
    router.refresh()
  }

  const save = () => update({ status, payment_status: pay }, 'Pedido actualizado')

  const markSold = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: 'entregue', payment_status: 'pago' } as never).eq('id', order.id)
    setLoading(false)
    if (error) { toast.error('Erro ao actualizar', error.message); return }
    notifyDelivered()
    toast.success(order.customer_email ? 'Vendido — email de entrega enviado ao cliente' : 'Pedido marcado como vendido')
    setStatus('entregue'); setPay('pago')
    router.refresh()
  }

  const markPending = () => {
    setStatus('pendente'); setPay('pendente')
    void update({ status: 'pendente', payment_status: 'pendente' }, 'Pedido voltou a pendente')
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      {sold ? (
        <Button variant="outline" onClick={markPending} loading={loading}><Undo2 className="h-4 w-4" /> Voltar a pendente</Button>
      ) : (
        <Button onClick={markSold} loading={loading} className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600"><CheckCircle2 className="h-4 w-4" /> Marcar vendido</Button>
      )}
      <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="w-44" aria-label="Estado do pedido">
        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </Select>
      <Select value={pay} onChange={(e) => setPay(e.target.value as PaymentStatus)} className="w-40" aria-label="Estado do pagamento">
        {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </Select>
      <Button variant="outline" onClick={save} loading={loading} disabled={status === order.status && pay === order.payment_status}>Guardar</Button>
    </div>
  )
}

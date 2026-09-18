'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingBag, CheckCircle2 } from 'lucide-react'
import { useCart } from '@/components/store/cart-context'
import { Button, Field, Input, Select, Textarea, EmptyState, ButtonLink } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { formatKz } from '@/lib/utils'

export default function CheckoutPage() {
  const { items, subtotal, clear, hydrated } = useCart()
  const toast = useToast()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [done, setDone] = React.useState<{ number: string; total: number } | null>(null)
  const [form, setForm] = React.useState({ name: '', phone: '', email: '', delivery: 'levantamento', address: '', payment: 'Transferência bancária', coupon: '', notes: '' })
  const [fee] = React.useState(0)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('profiles').select('full_name,phone').eq('id', data.user.id).single().then(({ data: p }) => {
        if (p) setForm((f) => ({ ...f, name: f.name || p.full_name || '', phone: f.phone || p.phone || '' }))
      })
      if (data.user.email) setForm((f) => ({ ...f, email: f.email || data.user!.email! }))
    })
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Preenche nome e telefone'); return }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('place_order', {
      payload: {
        name: form.name, phone: form.phone, email: form.email || null,
        delivery_method: form.delivery, address: form.address || null,
        payment_method: form.payment, coupon: form.coupon || null, notes: form.notes || null,
        channel: 'website',
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      },
    })
    setLoading(false)
    if (error) { toast.error('Não foi possível criar o pedido', error.message); return }
    const res = data as { order_number: string; total: number }
    setDone({ number: res.order_number, total: res.total })
    clear()
  }

  if (!hydrated) return <div className="shell py-16 text-center text-sm text-ink-muted">A carregar…</div>
  if (done)
    return (
      <div className="shell max-w-lg py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-semibold">Pedido recebido!</h1>
        <p className="mt-2 text-ink-muted">O teu pedido <strong className="text-ink">{done.number}</strong> foi criado com total de <strong className="text-ink">{formatKz(done.total)}</strong>. Vamos contactar-te para confirmar.</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href={`/fatura?n=${done.number}&t=${encodeURIComponent(form.phone)}`}>Ver fatura</ButtonLink>
          <ButtonLink href={`/pedido?n=${done.number}&t=${encodeURIComponent(form.phone)}`} variant="outline">Acompanhar pedido</ButtonLink>
          <ButtonLink href="/loja" variant="outline">Continuar a comprar</ButtonLink>
        </div>
      </div>
    )
  if (items.length === 0)
    return <div className="shell py-8"><EmptyState icon={<ShoppingBag className="h-6 w-6" />} title="O carrinho está vazio" action={<ButtonLink href="/loja">Ir à loja</ButtonLink>} /></div>

  const total = subtotal + (form.delivery === 'entrega' ? fee : 0)
  return (
    <div className="shell py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-line p-5">
            <h2 className="font-semibold">Os teus dados</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" required><Input value={form.name} onChange={(e) => set('name', e.target.value)} required /></Field>
              <Field label="Telefone / WhatsApp" required><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+244 …" required /></Field>
              <Field label="Email" className="sm:col-span-2"><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
            </div>
          </div>
          <div className="rounded-lg border border-line p-5">
            <h2 className="font-semibold">Entrega</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Método">
                <Select value={form.delivery} onChange={(e) => set('delivery', e.target.value)}>
                  <option value="levantamento">Levantamento na loja</option>
                  <option value="entrega">Entrega ao domicílio</option>
                </Select>
              </Field>
              {form.delivery === 'entrega' && <Field label="Endereço" required><Input value={form.address} onChange={(e) => set('address', e.target.value)} required={form.delivery === 'entrega'} /></Field>}
              <Field label="Pagamento" className="sm:col-span-2">
                <Select value={form.payment} onChange={(e) => set('payment', e.target.value)}>
                  <option>Transferência bancária</option>
                  <option>Multicaixa Express</option>
                  <option>Dinheiro na entrega</option>
                </Select>
              </Field>
            </div>
          </div>
          <div className="rounded-lg border border-line p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cupão de desconto"><Input value={form.coupon} onChange={(e) => set('coupon', e.target.value)} placeholder="Código (opcional)" /></Field>
              <Field label="Notas"><Input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Opcional" /></Field>
            </div>
          </div>
        </div>
        <div className="h-fit rounded-lg border border-line p-5 lg:sticky lg:top-32">
          <h2 className="font-semibold">O teu pedido</h2>
          <ul className="mt-3 max-h-56 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-surface">{i.image && <Image src={i.image} alt="" fill sizes="44px" className="object-cover" />}</div>
                <span className="flex-1 leading-tight">{i.name} <span className="text-ink-muted">×{i.quantity}</span></span>
                <span className="tabular">{formatKz(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-3 text-sm">
            <div className="flex justify-between"><span className="text-ink-muted">Subtotal</span><span className="tabular">{formatKz(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-ink-muted">Entrega</span><span className="tabular">{formatKz(form.delivery === 'entrega' ? fee : 0)}</span></div>
            <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="tabular">{formatKz(total)}</span></div>
          </div>
          <Button type="submit" size="lg" loading={loading} className="mt-4 w-full">Confirmar pedido</Button>
          <p className="mt-3 text-center text-xs text-ink-muted">Sem registo obrigatório. Confirmamos por telefone/WhatsApp.</p>
        </div>
      </form>
    </div>
  )
}

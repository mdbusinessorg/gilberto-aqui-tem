'use client'
import Link from '@/components/ui/navigation-link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react'
import { useCart } from '@/components/store/cart-context'
import { Button, ButtonLink, EmptyState } from '@/components/ui'
import { formatKz } from '@/lib/utils'
import { waLink, cartMessage } from '@/lib/whatsapp'

export default function CartPage() {
  const { items, setQty, remove, clear, subtotal, hydrated } = useCart()
  if (!hydrated) return <div className="shell py-16 text-center text-sm text-ink-muted">A carregar…</div>
  if (items.length === 0)
    return (
      <div className="shell py-8">
        <EmptyState icon={<ShoppingBag className="h-6 w-6" />} title="O carrinho está vazio" description="Adiciona produtos da loja para continuar."
          action={<ButtonLink href="/loja">Explorar a loja</ButtonLink>} />
      </div>
    )
  return (
    <div className="shell py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Carrinho</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-line rounded-lg border border-line">
            {items.map((i) => (
              <li key={i.id} className="flex gap-4 p-4">
                <Link href={`/produto/${i.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-surface">
                  {i.image ? <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" /> : null}
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link href={`/produto/${i.slug}`} className="text-sm font-medium hover:text-brand-700">{i.name}</Link>
                  {i.detail && <p className="text-xs text-ink-muted">{i.detail}</p>}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex h-8 items-center rounded-md border border-line">
                      <button onClick={() => setQty(i.id, i.quantity - 1)} className="px-2 text-ink-soft" aria-label="Menos"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm tabular">{i.quantity}</span>
                      <button onClick={() => setQty(i.id, i.quantity + 1)} className="px-2 text-ink-soft" aria-label="Mais"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="text-sm font-semibold tabular">{formatKz(i.price * i.quantity)}</span>
                  </div>
                </div>
                <button onClick={() => remove(i.id)} className="self-start p-1.5 text-ink-muted hover:text-red-600" aria-label="Remover"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          <button onClick={clear} className="mt-3 text-xs text-ink-muted hover:text-red-600">Esvaziar carrinho</button>
        </div>
        <div className="rounded-lg border border-line p-5 h-fit lg:sticky lg:top-32">
          <h2 className="font-semibold">Resumo</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-muted">Subtotal</span><span className="tabular">{formatKz(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-ink-muted">Entrega</span><span className="text-ink-muted">no checkout</span></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><span>Total estimado</span><span className="tabular">{formatKz(subtotal)}</span></div>
          </div>
          <ButtonLink href="/checkout" size="lg" className="mt-4 w-full">Finalizar compra <ArrowRight className="h-4 w-4" /></ButtonLink>
          <a href={waLink(cartMessage(items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })), subtotal))} target="_blank" rel="noopener" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] text-sm font-medium text-white hover:bg-[#1fb857]">
            <MessageCircle className="h-4 w-4" /> Encomendar por WhatsApp
          </a>
          <Link href="/loja" className="mt-3 block text-center text-xs text-ink-muted hover:text-ink">Continuar a comprar</Link>
        </div>
      </div>
    </div>
  )
}

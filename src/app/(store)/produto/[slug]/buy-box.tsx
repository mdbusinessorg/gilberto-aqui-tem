'use client'
import * as React from 'react'
import { Minus, Plus, ShoppingBag, MessageCircle, Heart } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { useCart } from '@/components/store/cart-context'
import { priceOf } from '@/lib/store/price'
import type { StorefrontProduct } from '@/lib/store/queries'
import { waLink, productMessage } from '@/lib/whatsapp'
import { createClient } from '@/lib/supabase/client'

export function ProductBuyBox({ p }: { p: StorefrontProduct }) {
  const [qty, setQty] = React.useState(1)
  const [saved, setSaved] = React.useState(false)
  const { add } = useCart()
  const toast = useToast()
  const price = priceOf(p)
  const out = (p.stock_total ?? 0) <= 0
  const max = p.stock_total ?? 1
  const detail = [p.storage, p.color].filter(Boolean).join(' · ')

  const addCart = (then?: () => void) => {
    add({ id: p.id!, slug: p.slug!, name: p.name!, price: price.final, image: p.image_url, stock: max, sku: p.sku!, detail }, qty)
    toast.success('Adicionado ao carrinho')
    then?.()
  }

  const wishlist = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.assign('/entrar?next=' + encodeURIComponent(`/produto/${p.slug}`)); return }
    const { error } = await supabase.from('wishlists').upsert({ profile_id: user.id, product_id: p.id! } as never)
    if (error) toast.error('Não foi possível guardar'); else { setSaved(true); toast.success('Guardado nos favoritos') }
  }

  const waMsg = productMessage({ name: p.name ?? '', price: price.final, storage: p.storage, color: p.color, condition: p.condition, sku: p.sku }, typeof window !== 'undefined' ? window.location.href : undefined)

  return (
    <div className="mt-6 space-y-3">
      {out ? (
        <p className="rounded-md bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">Produto esgotado — fala connosco para reservar ou receber aviso de reposição.</p>
      ) : (
        <p className="text-sm font-medium text-emerald-700">Em stock{max <= 3 ? ` — só ${max} restantes` : ''}</p>
      )}
      <div className="flex items-center gap-3">
        {!out && (
          <div className="flex h-12 items-center rounded-md border border-line">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 text-ink-soft hover:text-ink" aria-label="Menos"><Minus className="h-4 w-4" /></button>
            <span className="w-8 text-center text-sm font-medium tabular">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(max, q + 1))} className="px-3 text-ink-soft hover:text-ink" aria-label="Mais"><Plus className="h-4 w-4" /></button>
          </div>
        )}
        <button onClick={wishlist} className={`flex h-12 w-12 items-center justify-center rounded-md border ${saved ? 'border-red-200 bg-red-50 text-red-600' : 'border-line text-ink-soft hover:text-ink'}`} aria-label="Favorito"><Heart className="h-5 w-5" fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="flex-1" disabled={out} onClick={() => addCart()}>
          <ShoppingBag className="h-4 w-4" /> Adicionar ao carrinho
        </Button>
        <a href={waLink(waMsg)} target="_blank" rel="noopener" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 text-[15px] font-medium text-white hover:bg-[#1fb857]">
          <MessageCircle className="h-4 w-4" /> Comprar no WhatsApp
        </a>
      </div>
      {!out && (
        <Button size="lg" variant="dark" className="w-full" onClick={() => addCart(() => window.location.assign('/checkout'))}>
          Comprar agora
        </Button>
      )}
    </div>
  )
}

'use client'
import * as React from 'react'
import { Minus, Plus, MessageCircle, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useCart } from '@/components/store/cart-context'
import { priceOf } from '@/lib/store/price'
import type { StorefrontProduct } from '@/lib/store/queries'
import { waLink, productMessage } from '@/lib/whatsapp'
import { formatKz } from '@/lib/utils'

export function ProductBuyBox({ p, features }: { p: StorefrontProduct; features: [string, string][] }) {
  const [qty, setQty] = React.useState(1)
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

  const waMsg = productMessage({ name: p.name ?? '', price: price.final, storage: p.storage, color: p.color, condition: p.condition, sku: p.sku }, typeof window !== 'undefined' ? window.location.href : undefined)

  return (
    <>
      <ul className="pd-feats">
        {features.map(([k, v]) => (
          <li key={k} className="pd-feat">
            <span className="pd-feat-k">{k}</span>
            <span className="pd-feat-v">{v} <ChevronRight className="h-3.5 w-3.5" /></span>
          </li>
        ))}
        <li className="pd-feat">
          <span className="pd-feat-k">{out ? 'Esgotado' : 'Em stock'}</span>
          {out ? (
            <span className="pd-feat-v">Fala connosco para reservar</span>
          ) : (
            <span className="pd-qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos"><Minus className="h-3.5 w-3.5" /></button>
              <b>{qty}</b>
              <button onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="Mais"><Plus className="h-3.5 w-3.5" /></button>
            </span>
          )}
        </li>
      </ul>

      <div className="pd-actions">
        <a href={waLink(waMsg)} target="_blank" rel="noopener" className="pd-wa"><MessageCircle className="h-4 w-4" /> Comprar no WhatsApp</a>
        {!out && <button onClick={() => addCart(() => window.location.assign('/checkout'))} className="pd-now">Comprar agora</button>}
      </div>

      <div className="pd-bar">
        <div className="pd-price">
          <span className="pd-cur">Kz</span>
          <span className="pd-amt">{formatKz(price.final).replace(/\s?Kz/, '')}</span>
          {price.active && <s className="pd-old">{formatKz(price.price)}</s>}
        </div>
        <button disabled={out} onClick={() => addCart()} className="pd-cta">Adicionar ao carrinho</button>
      </div>
    </>
  )
}

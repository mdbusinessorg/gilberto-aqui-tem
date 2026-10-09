'use client'
import * as React from 'react'
import { Minus, Plus, MessageCircle, ShoppingCart, Zap, ShieldCheck, Truck, Lock, BadgeCheck } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useCart } from '@/components/store/cart-context'
import { priceOf } from '@/lib/store/price'
import type { StorefrontProduct } from '@/lib/store/queries'
import { waLink, productMessage } from '@/lib/whatsapp'
import { formatKz } from '@/lib/utils'

export function ProductBuyBox({ p, features }: { p: StorefrontProduct; features: [string, string][] }) {
  const [qty, setQty] = React.useState(1)
  const [added, setAdded] = React.useState(false)
  const { add } = useCart()
  const toast = useToast()
  const price = priceOf(p)
  const out = (p.stock_total ?? 0) <= 0
  const max = p.stock_total ?? 1
  const detail = [p.storage, p.color].filter(Boolean).join(' · ')

  const addCart = (then?: () => void) => {
    add({ id: p.id!, slug: p.slug!, name: p.name!, price: price.final, image: p.image_url, stock: max, sku: p.sku!, detail }, qty)
    setAdded(true); setTimeout(() => setAdded(false), 1600)
    toast.success('Adicionado ao carrinho')
    then?.()
  }

  const waMsg = productMessage({ name: p.name ?? '', price: price.final, storage: p.storage, color: p.color, condition: p.condition, sku: p.sku }, typeof window !== 'undefined' ? window.location.href : undefined)

  return (
    <>
      <div className="pd-price-row">
        <div className="pd-price">
          <span className="pd-amt">{formatKz(price.final)}</span>
          {price.active && <s className="pd-old">{formatKz(price.price)}</s>}
          {price.active && <span className="pd-save">Poupa {formatKz(price.price - price.final)}</span>}
        </div>
        <span className={`pd-stock ${out ? 'is-out' : ''}`}>{out ? 'Esgotado' : `${p.stock_total} em stock`}</span>
      </div>

      <ul className="pd-feats">
        {features.map(([k, v]) => (
          <li key={k + v} className="pd-feat">
            <span className="pd-feat-v">{v}</span>
            <span className="pd-feat-k">{k}</span>
          </li>
        ))}
      </ul>

      <div className="pd-buyrow">
        {!out && (
          <div className="pd-qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos"><Minus className="h-4 w-4" /></button>
            <b>{qty}</b>
            <button onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="Mais"><Plus className="h-4 w-4" /></button>
          </div>
        )}
        <button disabled={out} onClick={() => addCart()} className={`pd-add ${added ? 'is-added' : ''}`}>
          {added ? <><BadgeCheck className="h-[18px] w-[18px]" /> Adicionado!</> : <><ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho</>}
        </button>
      </div>
      <div className="pd-buyrow">
        {!out && (
          <button onClick={() => addCart(() => window.location.assign('/checkout'))} className="pd-now">
            <Zap className="h-4 w-4" /> Comprar agora
          </button>
        )}
        <a href={waLink(waMsg)} target="_blank" rel="noopener" className="pd-wa"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
      </div>

      <div className="pd-trust">
        {p.warranty_months ? <span><ShieldCheck className="h-4 w-4" /> Garantia {p.warranty_months} meses</span> : null}
        <span><Truck className="h-4 w-4" /> Levantamento ou entrega</span>
        <span><Lock className="h-4 w-4" /> Pagamento seguro</span>
      </div>

      <div className="pd-bar">
        <div className="pd-price">
          <span className="pd-amt">{formatKz(price.final)}</span>
          {price.active && <s className="pd-old">{formatKz(price.price)}</s>}
        </div>
        <button disabled={out} onClick={() => addCart()} className="pd-cta">{out ? 'Esgotado' : 'Adicionar'}</button>
      </div>
    </>
  )
}

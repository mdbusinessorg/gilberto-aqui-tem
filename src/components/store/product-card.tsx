'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Smartphone, ShoppingBag, Check } from 'lucide-react'
import { Badge, Stars } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { useCart } from './cart-context'
import { formatKz, cn } from '@/lib/utils'
import { CONDITION } from '@/lib/labels'
import { priceOf } from '@/lib/store/price'
import type { StorefrontProduct } from '@/lib/store/queries'

export function ProductImage({ src, alt, className, sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw', priority }: { src: string | null; alt: string; className?: string; sizes?: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className={cn('flex items-center justify-center bg-surface text-ink-muted/40', className)}>
        <Smartphone className="h-10 w-10" strokeWidth={1.25} />
      </div>
    )
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn('object-contain', className)} />
}

export function ProductCard({ p, compact, horizontal }: { p: StorefrontProduct; compact?: boolean; horizontal?: boolean }) {
  const { add } = useCart()
  const toast = useToast()
  const price = priceOf(p)
  const out = (p.stock_total ?? 0) <= 0
  const detail = [p.storage, p.color].filter(Boolean).join(' · ')

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (out) return
    add({ id: p.id!, slug: p.slug!, name: p.name!, price: price.final, image: p.image_url, stock: p.stock_total ?? 0, sku: p.sku!, detail })
    toast.success('Adicionado ao carrinho', p.name ?? undefined)
  }

  return (
    <Link href={`/produto/${p.slug}`} className={cn('product-card group flex flex-col border border-line bg-white transition-colors hover:border-brand-200', horizontal && 'product-card-horizontal')}>
      <div className="product-card-image relative aspect-square overflow-hidden">
        <ProductImage src={p.image_url} alt={p.name ?? ''} className="h-full w-full p-4" sizes={horizontal ? '(max-width: 640px) 30vw, 140px' : '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px'} />
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {price.active && <Badge tone="red">-{price.discount}%</Badge>}
          {p.condition && p.condition !== 'novo' && <Badge tone="slate">{CONDITION[p.condition].label}</Badge>}
          {out && <Badge tone="neutral">Esgotado</Badge>}
        </div>
        {!out && !compact && (
          <button onClick={quickAdd} className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-sm border border-line bg-white text-ink transition-colors md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-brand-600 hover:text-white" aria-label={`Adicionar ${p.name} ao carrinho`}>
            <ShoppingBag className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="product-card-body flex flex-1 flex-col p-3.5">
        <p className="product-card-brand text-[10px] font-medium uppercase tracking-wide text-ink-muted">{p.brand_name ?? p.category_name}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium text-ink leading-snug">{p.name}</h3>
        {detail && <p className="product-card-detail mt-0.5 text-xs text-ink-muted">{detail}</p>}
        {(p.rating_count ?? 0) > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars value={Number(p.rating_avg)} />
            <span className="text-xs text-ink-muted">({p.rating_count})</span>
          </div>
        )}
        <div className="product-card-price mt-auto pt-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[15px] font-semibold text-ink tabular">{formatKz(price.final)}</p>
            {price.active && <p className="text-xs text-ink-muted line-through tabular">{formatKz(price.price)}</p>}
          </div>
          {!out && (p.stock_total ?? 0) <= 3 && <span className="product-card-stock text-[11px] font-medium text-amber-600">Só {p.stock_total}</span>}
          {!out && (p.stock_total ?? 0) > 3 && <span className="product-card-stock inline-flex items-center gap-1 text-[11px] text-emerald-600"><Check className="h-3 w-3" /> Em stock</span>}
        </div>
      </div>
    </Link>
  )
}

export function ProductGrid({ products, compact }: { products: StorefrontProduct[]; compact?: boolean }) {
  return (
    <div className={cn('grid gap-3 sm:gap-4', compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4')}>
      {products.map((p) => <ProductCard key={p.id} p={p} compact={compact} />)}
    </div>
  )
}

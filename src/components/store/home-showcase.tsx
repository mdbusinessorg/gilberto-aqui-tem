'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from './product-card'
import { cn } from '@/lib/utils'
import type { StorefrontProduct } from '@/lib/store/queries'

export type HeroSlide = {
  title: string
  subtitle: string
  image: string
  href: string
  label: string
  phone?: boolean
}

export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0)
  const slide = slides[active]
  if (!slide) return null

  return (
    <section aria-roledescription="carrossel" aria-label="Destaques da loja" className={cn('store-hero', slide.phone && 'store-hero-phone')}>
      <Image src={slide.image} alt="" fill priority={active === 0} sizes="(max-width: 767px) 100vw, 850px" className="hero-product" />
      <div className="hero-copy" aria-live="polite">
        <p className="hero-eyebrow">GILBERTO AQUI TEM</p>
        <h1>{slide.title}</h1>
        <p className="hero-subtitle">{slide.subtitle}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold">
          <Link href={slide.href} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">{slide.label} <ArrowRight className="h-3.5 w-3.5" /></Link>
          <span className="h-3 border-l border-current opacity-40" />
          <Link href="/trocas" className="underline-offset-4 hover:underline">Compramos e trocamos</Link>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {slides.map((s, index) => <button key={s.title} onClick={() => setActive(index)} aria-label={`Mostrar ${s.title}`} aria-pressed={active === index} className="flex h-7 w-7 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700"><span className={cn('h-2.5 w-2.5 rounded-full border border-white', active === index ? 'bg-white' : 'bg-black/20')} /></button>)}
        </div>
      )}
    </section>
  )
}

export function HomeProductTabs({ tabs }: { tabs: { label: string; products: StorefrontProduct[] }[] }) {
  const id = useId()
  const [active, setActive] = useState(0)
  const [page, setPage] = useState(0)
  const products = tabs[active]?.products ?? []
  const pages = Math.ceil(products.length / 3)
  const select = (index: number) => { setActive(index); setPage(0) }

  return (
    <section aria-label="Produtos da loja" className="home-tabs">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Selecção de produtos" className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => <button key={tab.label} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={index === active} tabIndex={index === active ? 0 : -1} onClick={() => select(index)} onKeyDown={(event) => {
            const next = event.key === 'ArrowRight' ? (active + 1) % tabs.length : event.key === 'ArrowLeft' ? (active + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
            if (next != null) { event.preventDefault(); select(next); document.getElementById(`${id}-tab-${next}`)?.focus() }
          }} className={cn('product-tab', active === index && 'product-tab-active')}>{tab.label}</button>)}
        </div>
        <div className="flex shrink-0 gap-1">
          <button className="home-arrow" aria-label="Produtos anteriores" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button className="home-arrow" aria-label="Próximos produtos" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} tabIndex={0}>
        {products.length ? <div className="home-primary-products">{products.slice(page * 3, page * 3 + 3).map(p => <ProductCard key={p.id} p={p} />)}</div> : <p className="py-16 text-center text-sm text-ink-muted">Sem produtos nesta selecção. <Link href="/loja" className="underline">Explorar a loja</Link></p>}
      </div>
    </section>
  )
}

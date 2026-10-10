'use client'
import * as React from 'react'
import Image from 'next/image'
import { Smartphone, Heart, ArrowLeft, X, ChevronLeft, ChevronRight, Expand, LayoutGrid } from 'lucide-react'
import Link from '@/components/ui/navigation-link'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

type Img = { id: string; url: string; alt: string | null }

export function ProductGallery({ images, fallback, name, brand, tag, productId, slug }: {
  images: Img[]; fallback: string | null; name: string; brand: string | null; tag: string | null; productId: string; slug: string
}) {
  const all = images.length > 0 ? images : fallback ? [{ id: 'f', url: fallback, alt: name }] : []
  const [idx, setIdx] = React.useState(0)
  const [saved, setSaved] = React.useState(false)
  const [zoom, setZoom] = React.useState(false)
  const toast = useToast()
  const current = all[idx]

  const wishlist = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.assign('/entrar?next=' + encodeURIComponent(`/produto/${slug}`)); return }
    const { error } = await supabase.from('wishlists').upsert({ profile_id: user.id, product_id: productId } as never)
    if (error) toast.error('Não foi possível guardar'); else { setSaved(true); toast.success('Guardado nos favoritos'); void fetch('/api/metrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: productId, type: 'favs' }) }).catch(() => {}) }
  }

  React.useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false)
      if (e.key === 'ArrowRight') setIdx(i => Math.min(all.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom, all.length])

  return (
    <div className="pd-hero">
      <div className="pd-top">
        <Link href="/loja" aria-label="Voltar" className="pd-icon"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="pd-crumb">Loja / {brand ?? 'Produto'}</p>
        <Link href="/loja" aria-label="Loja" className="pd-icon"><LayoutGrid className="h-5 w-5" /></Link>
      </div>

      <div className="pd-gal">
        <div className="pd-gal-main" onClick={() => all.length > 0 && setZoom(true)} role={all.length > 0 ? 'button' : undefined} aria-label="Ampliar imagem">
          <div className="pd-gal-tags">
            {tag && <span className="pd-gal-tag">{tag}</span>}
            {brand && <span className="pd-gal-tag pd-gal-tag-soft">{brand}</span>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); wishlist() }} className={cn('pd-gal-fav', saved && 'is-on')} aria-label="Favorito">
            <Heart className="h-[18px] w-[18px]" fill={saved ? 'currentColor' : 'none'} />
          </button>
          {all.length > 0 && <span className="pd-gal-zoom" aria-hidden="true"><Expand className="h-3.5 w-3.5" /></span>}
          {all.map((img, i) => (
            <Image key={img.id} src={img.url} alt={img.alt ?? name} fill priority={i === 0}
              sizes="(max-width:1024px) 100vw, 46vw"
              className={cn('pd-gal-img object-contain', i === idx && 'is-on')} />
          ))}
          {all.length === 0 && <div className="flex h-full items-center justify-center text-ink-muted/25"><Smartphone className="h-24 w-24" strokeWidth={1} /></div>}
        </div>
        {all.length > 1 && (
          <div className="pd-gal-thumbs">
            {all.map((img, i) => (
              <button key={img.id} onClick={() => setIdx(i)} className={cn('pd-gal-thumb', i === idx && 'is-on')} aria-label={`Imagem ${i + 1}`}>
                <Image src={img.url} alt={img.alt ?? name} fill sizes="84px" className="object-contain p-1.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoom && current && (
        <div className="pd-light" role="dialog" aria-modal="true" aria-label={name} onClick={() => setZoom(false)}>
          <button className="pd-light-x" aria-label="Fechar"><X className="h-5 w-5" /></button>
          {idx > 0 && <button className="pd-light-nav l" onClick={(e) => { e.stopPropagation(); setIdx(i => i - 1) }} aria-label="Anterior"><ChevronLeft className="h-6 w-6" /></button>}
          <div className="pd-light-img" onClick={(e) => e.stopPropagation()}>
            <Image src={current.url} alt={current.alt ?? name} fill className="object-contain" sizes="100vw" />
          </div>
          {idx < all.length - 1 && <button className="pd-light-nav r" onClick={(e) => { e.stopPropagation(); setIdx(i => i + 1) }} aria-label="Seguinte"><ChevronRight className="h-6 w-6" /></button>}
        </div>
      )}
    </div>
  )
}

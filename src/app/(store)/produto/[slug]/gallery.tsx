'use client'
import * as React from 'react'
import Image from 'next/image'
import { Smartphone, Heart, ArrowLeft, LayoutGrid } from 'lucide-react'
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
  const toast = useToast()
  const current = all[idx]

  const wishlist = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.assign('/entrar?next=' + encodeURIComponent(`/produto/${slug}`)); return }
    const { error } = await supabase.from('wishlists').upsert({ profile_id: user.id, product_id: productId } as never)
    if (error) toast.error('Não foi possível guardar'); else { setSaved(true); toast.success('Guardado nos favoritos') }
  }

  return (
    <div className="pd-hero">
      <div className="pd-top">
        <Link href="/loja" aria-label="Voltar" className="pd-icon"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="pd-title">{name}</h1>
        <Link href="/loja" aria-label="Loja" className="pd-icon"><LayoutGrid className="h-5 w-5" /></Link>
      </div>
      <div className="pd-stage">
        <div className="pd-blob" />
        {brand && <span className="pd-brand">{brand}</span>}
        <div className="pd-pills">
          {tag && <span className="pd-pill">{tag}</span>}
          <button onClick={wishlist} className={cn('pd-pill pd-pill-btn', saved && 'is-on')} aria-label="Favorito"><Heart className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} /></button>
        </div>
        <div className="pd-img">
          {current ? (
            <Image src={current.url} alt={current.alt ?? name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-contain drop-shadow-2xl" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-muted/30"><Smartphone className="h-20 w-20" strokeWidth={1} /></div>
          )}
        </div>
        {all.length > 1 && (
          <div className="pd-thumbs">
            {all.slice(0, 4).map((img, i) => (
              <button key={img.id} onClick={() => setIdx(i)} className={cn('pd-thumb', i === idx && 'is-on')}>
                <Image src={img.url} alt={img.alt ?? name} fill sizes="72px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

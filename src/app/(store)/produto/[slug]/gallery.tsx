'use client'
import * as React from 'react'
import Image from 'next/image'
import { Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

type Img = { id: string; url: string; alt: string | null }

export function ProductGallery({ images, fallback, name }: { images: Img[]; fallback: string | null; name: string }) {
  const all = images.length > 0 ? images : fallback ? [{ id: 'f', url: fallback, alt: name }] : []
  const [idx, setIdx] = React.useState(0)
  const current = all[idx]
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface">
        {current ? (
          <Image src={current.url} alt={current.alt ?? name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted/30"><Smartphone className="h-20 w-20" strokeWidth={1} /></div>
        )}
      </div>
      {all.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {all.map((img, i) => (
            <button key={img.id} onClick={() => setIdx(i)} className={cn('relative h-20 w-20 shrink-0 overflow-hidden rounded-md border', i === idx ? 'border-brand-600 ring-2 ring-brand-500/30' : 'border-line')}>
              <Image src={img.url} alt={img.alt ?? name} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

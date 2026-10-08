'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from '@/components/ui/navigation-link'
import { cn } from '@/lib/utils'

export type HeroSlide = { title: string; sub?: string | null; cta?: string | null; href: string; image: string | null }

const BGS = ['#f1f2f4', '#eef2fb', '#f5efe8']

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])
  if (!slides.length) return null
  return (
    <section className="sm-hero" aria-label="Destaque">
      {slides.map((s, i) => (
        <div key={i} className={cn('sm-hero-slide', i === idx && 'on')} style={{ background: BGS[i % BGS.length] }} aria-hidden={i !== idx}>
          <div className="sm-hero-copy">
            <p className="sm-hero-eyebrow">Gilberto Aqui Tem</p>
            <h1>{s.title}</h1>
            {s.sub && <p className="sm-hero-sub">{s.sub}</p>}
            <div><Link href={s.href} className="sm-hero-cta" tabIndex={i === idx ? 0 : -1}>{s.cta ?? 'Comprar agora'}</Link></div>
          </div>
          {s.image && <div className="sm-hero-media"><Image src={s.image} alt="" fill priority={i === 0} sizes="(max-width: 767px) 55vw, 420px" /></div>}
        </div>
      ))}
      {slides.length > 1 && (
        <div className="sm-hero-nav">
          {slides.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={i === idx ? 'on' : ''} aria-label={`Slide ${i + 1}`} />)}
        </div>
      )}
    </section>
  )
}

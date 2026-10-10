'use client'
import * as React from 'react'
import Image from 'next/image'
import { Star, Camera, Send, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Item = { id: string; name: string }

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const max = 900
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/webp', 0.82))
      URL.revokeObjectURL(img.src)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function ReviewForm({ item, number, phone }: { item: Item; number: string; phone: string }) {
  const [rating, setRating] = React.useState(0)
  const [hover, setHover] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [photo, setPhoto] = React.useState<string | null>(null)
  const [state, setState] = React.useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const fileRef = React.useRef<HTMLInputElement>(null)

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try { setPhoto(await compressImage(f)) } catch { /* ignora */ }
  }

  const submit = async () => {
    if (!rating || comment.trim().length < 3 || state === 'sending') return
    setState('sending')
    try {
      const res = await fetch('/api/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: number, phone, product_id: item.id, rating, comment, photo }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch { setState('error') }
  }

  if (state === 'done')
    return <p className="flex items-center gap-2 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Obrigado! A tua avaliação de <strong>{item.name}</strong> vai aparecer na loja após revisão.</p>

  return (
    <div className="rounded-2xl border border-line bg-white p-4 text-left">
      <p className="text-sm font-semibold">{item.name}</p>
      <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} aria-label={`${n} estrelas`}
            className="p-0.5 transition-transform hover:scale-110">
            <Star className={cn('h-7 w-7', (hover || rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={1000}
        placeholder="Conta como foi a tua experiência com o produto…"
        className="mt-3 w-full rounded-xl border border-line bg-surface/50 px-3 py-2 text-sm outline-none focus:border-brand-400" />
      <div className="mt-3 flex items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs font-medium text-ink-muted hover:border-brand-400 hover:text-brand-700">
          <Camera className="h-4 w-4" /> {photo ? 'Trocar foto' : 'Foto do que recebeste (opcional)'}
        </button>
        {photo && <span className="relative h-12 w-12 overflow-hidden rounded-lg border border-line"><Image src={photo} alt="Foto" fill className="object-cover" unoptimized /></span>}
      </div>
      {state === 'error' && <p className="mt-2 text-xs text-red-600">Não foi possível enviar — tenta de novo.</p>}
      <button type="button" onClick={submit} disabled={!rating || comment.trim().length < 3 || state === 'sending'}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40">
        <Send className="h-4 w-4" /> {state === 'sending' ? 'A enviar…' : 'Enviar avaliação'}
      </button>
    </div>
  )
}

export function ReviewPrompt({ items, number, phone }: { items: Item[]; number: string; phone: string }) {
  const [open, setOpen] = React.useState(false)
  if (!items.length) return null
  return (
    <div className="mt-8">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-ink hover:border-brand-400">
          <Star className="h-4 w-4 text-amber-400" /> Avaliar os produtos que comprei
        </button>
      ) : (
        <div className="grid gap-3 text-left">
          <p className="text-sm font-semibold text-ink">Avalia o que compraste — ajuda outros clientes.</p>
          {items.map((i) => <ReviewForm key={i.id} item={i} number={number} phone={phone} />)}
        </div>
      )}
    </div>
  )
}

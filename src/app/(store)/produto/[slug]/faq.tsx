'use client'
import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(0)
  return (
    <div className="pd-faq">
      {items.map((it, i) => (
        <div key={i} className={cn('pd-faq-i', open === i && 'is-open')}>
          <button type="button" className="pd-faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>{it.q}</span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>
          <div className="pd-faq-a"><div className="pd-faq-a-in">{it.a}</div></div>
        </div>
      ))}
    </div>
  )
}

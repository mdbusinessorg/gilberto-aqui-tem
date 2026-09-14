'use client'
import * as React from 'react'
import { Send } from 'lucide-react'
import { waLink } from '@/lib/whatsapp'

export function NewsletterBar() {
  const [email, setEmail] = React.useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = email.trim() ? `Olá! Quero subscrever a newsletter com o email: ${email.trim()}` : 'Olá! Quero subscrever a newsletter da loja.'
    window.open(waLink(msg), '_blank', 'noopener')
  }
  return (
    <div className="bg-brand-600">
      <div className="shell flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-white">Subscreve para novidades e promoções</p>
        <form onSubmit={submit} className="flex w-full max-w-sm">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="O teu email"
            className="h-10 w-full rounded-l-md border-0 px-3 text-sm text-ink focus:outline-none"
          />
          <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-r-md bg-brand-800 px-4 text-xs font-semibold uppercase tracking-wide text-white">Subscrever <Send className="h-3.5 w-3.5" /></button>
        </form>
      </div>
    </div>
  )
}

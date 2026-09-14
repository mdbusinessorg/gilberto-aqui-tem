'use client'
import * as React from 'react'
import { Send, Instagram, Facebook, MessageCircle } from 'lucide-react'
import { waLink } from '@/lib/whatsapp'

export function NewsletterBar() {
  const [email, setEmail] = React.useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = email.trim() ? `Olá! Quero subscrever a newsletter com o email: ${email.trim()}` : 'Olá! Quero subscrever a newsletter da loja.'
    window.open(waLink(msg), '_blank', 'noopener')
  }
  return (
    <div className="store-newsletter">
      <div className="shell flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
        <div className="flex gap-5 text-white">
          <a href="https://instagram.com/Gilberto_Aqui_Tem" target="_blank" rel="noopener" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
          <a href={waLink('Olá! Quero conhecer as novidades.')} target="_blank" rel="noopener" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white">Novidades e promoções</p>
        <form onSubmit={submit} className="flex w-full max-w-sm">
          <input
            type="email"
            required
            aria-label="O teu email para novidades"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="O teu email"
            className="h-10 w-full min-w-0 rounded-l-full border-0 px-4 text-xs text-ink focus:outline-none"
          />
          <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-r-full border-4 border-white bg-sky-600 px-3 text-[10px] font-semibold uppercase tracking-wide text-white">Subscrever <Send className="h-3 w-3" /></button>
        </form>
      </div>
    </div>
  )
}

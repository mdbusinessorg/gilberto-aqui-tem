'use client'
import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, ShoppingBag, User, Menu, X, Heart, MessageCircle, LayoutDashboard } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { useCart } from './cart-context'
import { cn } from '@/lib/utils'
import { waLink, supportMessage, WHATSAPP_DISPLAY } from '@/lib/whatsapp'

export type NavCategory = { name: string; slug: string }

export function StoreHeader({ categories, user }: { categories: NavCategory[]; user: { name: string | null; isStaff: boolean } | null }) {
  const { count, hydrated } = useCart()
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')
  const router = useRouter()
  const pathname = usePathname()
  React.useEffect(() => setOpen(false), [pathname])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(q.trim() ? `/loja?q=${encodeURIComponent(q.trim())}` : '/loja')
  }

  const nav = [
    { href: '/loja', label: 'Loja' },
    ...categories.slice(0, 6).map((c) => ({ href: `/categoria/${c.slug}`, label: c.name })),
    { href: '/trocas', label: 'Trocas' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/contacto', label: 'Contacto' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="hidden bg-brand-900 text-brand-100 sm:block">
        <div className="shell flex h-8 items-center justify-between text-xs">
          <span>Compramos, vendemos e trocamos · Luanda, Angola</span>
          <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 hover:text-white"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp {WHATSAPP_DISPLAY}</a>
        </div>
      </div>
      <div className="shell flex h-16 items-center gap-4">
        <button className="lg:hidden -ml-2 p-2 text-ink-soft" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
        <Logo />
        <form onSubmit={submit} className="hidden flex-1 md:flex max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar iPhone, Samsung, PlayStation, capas…" className="h-10 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/loja" className="md:hidden p-2 text-ink-soft hover:text-ink" aria-label="Procurar"><Search className="h-5 w-5" /></Link>
          {user?.isStaff && (
            <Link href="/admin" className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"><LayoutDashboard className="h-4 w-4" /> Gestão</Link>
          )}
          <Link href="/conta/favoritos" className="hidden sm:block p-2 text-ink-soft hover:text-ink" aria-label="Favoritos"><Heart className="h-5 w-5" /></Link>
          <Link href={user ? '/conta' : '/entrar'} className="p-2 text-ink-soft hover:text-ink inline-flex items-center gap-1.5" aria-label="Conta">
            <User className="h-5 w-5" />
            <span className="hidden lg:inline text-sm font-medium">{user ? (user.name?.split(' ')[0] ?? 'Conta') : 'Entrar'}</span>
          </Link>
          <Link href="/carrinho" className="relative p-2 text-ink-soft hover:text-ink" aria-label="Carrinho">
            <ShoppingBag className="h-5 w-5" />
            {hydrated && count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">{count}</span>}
          </Link>
        </div>
      </div>
      <nav className="hidden border-t border-line lg:block">
        <div className="shell flex h-11 items-center gap-6 text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={cn('font-medium transition-colors', pathname === n.href ? 'text-brand-700' : 'text-ink-soft hover:text-ink')}>{n.label}</Link>
          ))}
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-pop flex flex-col">
            <div className="flex items-center justify-between border-b border-line px-4 h-16">
              <Logo />
              <button onClick={() => setOpen(false)} className="p-2 text-ink-soft" aria-label="Fechar"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submit} className="p-4 border-b border-line">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar produtos…" className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm" />
            </form>
            <div className="flex-1 overflow-y-auto p-2">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="block rounded-md px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-surface">{n.label}</Link>
              ))}
              <div className="my-2 border-t border-line" />
              <Link href={user ? '/conta' : '/entrar'} className="block rounded-md px-3 py-2.5 text-[15px] text-ink-soft hover:bg-surface">{user ? 'A minha conta' : 'Entrar / Criar conta'}</Link>
              <Link href="/conta/favoritos" className="block rounded-md px-3 py-2.5 text-[15px] text-ink-soft hover:bg-surface">Favoritos</Link>
              {user?.isStaff && <Link href="/admin" className="block rounded-md px-3 py-2.5 text-[15px] font-medium text-brand-700 hover:bg-brand-50">Painel de gestão</Link>}
            </div>
            <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="m-4 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#25D366] text-white font-medium"><MessageCircle className="h-4 w-4" /> Falar no WhatsApp</a>
          </div>
        </div>
      )}
    </header>
  )
}

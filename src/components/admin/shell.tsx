'use client'
import * as React from 'react'
import Link from '@/components/ui/navigation-link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Users, RefreshCw, Star, UserCog,
  ClipboardCheck, ListTodo, Truck, ShoppingBag, Tag, BarChart3, Bell, ScrollText, Settings, Store, Menu, X, LogOut, Search, ChevronDown, ArrowUpRight, Sparkles,
} from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, isAdminRole, type UserRole } from '@/lib/labels'
import { Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export type AdminNavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }
const SECTIONS: { title?: string; items: AdminNavItem[] }[] = [
  { items: [
    { href: '/admin', label: 'Painel', icon: LayoutDashboard },
    { href: '/admin/pedidos', label: 'Pedidos & Vendas', icon: ShoppingCart },
    { href: '/admin/produtos', label: 'Produtos', icon: Package },
    { href: '/admin/armazem', label: 'Armazém', icon: Warehouse },
    { href: '/admin/clientes', label: 'Clientes', icon: Users },
    { href: '/admin/trocas', label: 'Trocas', icon: RefreshCw },
    { href: '/admin/avaliacoes', label: 'Avaliações', icon: Star },
  ]},
  { title: 'Equipa', items: [
    { href: '/admin/funcionarios', label: 'Funcionários', icon: UserCog },
    { href: '/admin/pontualidade', label: 'Pontualidade', icon: ClipboardCheck },
    { href: '/admin/tarefas', label: 'Tarefas & Objectivos', icon: ListTodo },
  ]},
  { title: 'Operações', items: [
    { href: '/admin/fornecedores', label: 'Fornecedores', icon: Truck },
    { href: '/admin/compras', label: 'Compras', icon: ShoppingBag },
    { href: '/admin/promocoes', label: 'Promoções', icon: Tag },
    { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  ]},
  { title: 'Sistema', items: [
    { href: '/admin/notificacoes', label: 'Notificações', icon: Bell },
    { href: '/admin/auditoria', label: 'Auditoria', icon: ScrollText },
    { href: '/admin/definicoes', label: 'Definições', icon: Settings },
  ]},
]

export function AdminShell({ children, user }: { children: React.ReactNode; user: { name: string | null; role: UserRole } }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => setOpen(false), [pathname])
  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const nav = (
    <nav aria-label="Gestão da loja" className="admin-nav flex-1 overflow-y-auto p-3">
      {SECTIONS.map((s, i) => (
        <div key={i} className={i > 0 ? 'mt-5' : ''}>
          <p className="mb-2 px-3 text-[10px] uppercase tracking-[.15em] text-slate-400">{s.title ?? 'Menu principal'}</p>
          {(i === 0 && isAdminRole(user.role) ? [{ href: '/admin/assistente', label: 'Assistente (voz)', icon: Sparkles }, ...s.items] : s.items).map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn('mb-0.5 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-medium transition-colors',
                isActive(item.href) ? 'bg-brand-600 text-white' : 'text-ink hover:bg-brand-50 hover:text-brand-700')}>
              <item.icon className="h-4 w-4 shrink-0" />{item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )

  return (
    <div className="admin-workspace flex min-h-screen bg-[#f6f8fb]">
      <aside className="admin-rail fixed inset-y-3 left-3 z-40 hidden w-56 flex-col rounded-2xl border border-line bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-line px-4"><Logo /></div>
        {nav}
        <div className="border-t border-line p-3">
          <Link href="/" className="mb-1 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink hover:bg-brand-50"><Store className="h-4 w-4" /> Ver a loja <ArrowUpRight className="ml-auto h-4 w-4" /></Link>
          <div className="mt-1 flex items-center justify-between px-2.5 py-2">
            <div className="min-w-0"><p className="truncate text-[13px] font-medium text-ink">{user.name ?? 'Utilizador'}</p><Badge tone="blue" className="mt-1">{ROLE_LABELS[user.role]}</Badge></div>
            <button onClick={async () => { await createClient().auth.signOut(); window.location.assign('/entrar') }} className="p-2 text-ink-muted hover:text-brand-700" aria-label="Sair"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between border-b border-line px-4"><Logo /><button onClick={() => setOpen(false)} className="p-1 text-ink" aria-label="Fechar menu"><X className="h-5 w-5" /></button></div>
            {nav}
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="admin-topbar sticky top-0 z-30 m-3 mb-0 flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 lg:mx-6">
          <button onClick={() => setOpen(true)} className="p-1 text-ink-soft lg:hidden" aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
          <form action="/admin/produtos" role="search" className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-ink-muted" />
            <input name="q" aria-label="Pesquisar produtos na gestão" placeholder="Pesquisar produto ou SKU…" className="h-9 w-full min-w-0 bg-transparent text-sm outline-none focus:ring-2 focus:ring-brand-600" />
          </form>
          <Link href="/admin/notificacoes" aria-label="Notificações" className="ml-auto rounded-full border border-line p-2.5"><Bell className="h-4 w-4" /></Link>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">{(user.name ?? 'U').slice(0, 1).toUpperCase()}</span>
              <span className="hidden sm:block"><strong className="block max-w-40 truncate text-xs font-medium">{user.name ?? 'Utilizador'}</strong><span className="text-[10px] text-ink-muted">{ROLE_LABELS[user.role]}</span></span>
              <ChevronDown className="h-3 w-3" />
            </summary>
            <div className="absolute right-0 top-full mt-3 w-52 rounded-xl border border-line bg-white p-2 text-sm shadow-pop">
              <Link href="/conta" className="block rounded-lg px-3 py-2 hover:bg-surface">O meu perfil</Link>
              <Link href="/admin/pontualidade" className="block rounded-lg px-3 py-2 hover:bg-surface">Registo de ponto</Link>
              <Link href="/" className="block rounded-lg px-3 py-2 hover:bg-surface">Abrir a loja</Link>
              <button className="w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-surface" onClick={async () => { await createClient().auth.signOut(); window.location.assign('/entrar') }}>Terminar sessão</button>
            </div>
          </details>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

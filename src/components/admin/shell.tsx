'use client'
import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Users, RefreshCw, Star, UserCog,
  ClipboardCheck, ListTodo, Truck, ShoppingBag, Tag, BarChart3, Bell, ScrollText, Settings, Store, Menu, X, LogOut,
} from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, type UserRole } from '@/lib/labels'
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
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => setOpen(false), [pathname])
  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const nav = (
    <nav className="flex-1 overflow-y-auto p-3">
      {SECTIONS.map((s, i) => (
        <div key={i} className={i > 0 ? 'mt-5' : ''}>
          {s.title && <p className="mb-1.5 px-2 text-[10.5px] font-semibold uppercase tracking-wider text-brand-300/70">{s.title}</p>}
          {s.items.map((item) => (
            <Link key={item.href} href={item.href}
              className={cn('mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-colors',
                isActive(item.href) ? 'bg-white/10 text-white' : 'text-brand-200 hover:bg-white/5 hover:text-white')}>
              <item.icon className="h-4 w-4 shrink-0" />{item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-brand-950 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-4"><Logo light /></div>
        {nav}
        <div className="border-t border-white/10 p-3">
          <Link href="/" className="mb-1 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-brand-200 hover:bg-white/5 hover:text-white"><Store className="h-4 w-4" /> Ver a loja</Link>
          <div className="mt-1 flex items-center justify-between px-2.5 py-2">
            <div className="min-w-0"><p className="truncate text-[13px] font-medium text-white">{user.name ?? 'Utilizador'}</p><Badge tone="blue" className="mt-1">{ROLE_LABELS[user.role]}</Badge></div>
            <button onClick={async () => { await createClient().auth.signOut(); router.push('/entrar'); router.refresh() }} className="p-2 text-brand-200 hover:text-white" aria-label="Sair"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-brand-950">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4"><Logo light /><button onClick={() => setOpen(false)} className="p-1 text-white"><X className="h-5 w-5" /></button></div>
            {nav}
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="p-1 text-ink-soft"><Menu className="h-5 w-5" /></button>
          <Logo compact /><span className="text-sm font-semibold">Gestão</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

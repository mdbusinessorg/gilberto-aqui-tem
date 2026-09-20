import Link from '@/components/ui/navigation-link'
import { Receipt, ShoppingCart, Users, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui'
import { formatKz, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS } from '@/lib/labels'
import { HabitsChart, CategoryRings, ChannelBubbles } from './dashboard-charts'

export const dynamic = 'force-dynamic'

const CHANNEL: Record<string, string> = { website: 'Site', whatsapp: 'WhatsApp', loja: 'Loja física', manual: 'Manual' }
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function pct(cur: number, prev: number) {
  if (!prev) return cur ? 100 : 0
  return Math.round(((cur - prev) / prev) * 1000) / 10
}

export default async function AdminDashboard() {
  const supabase = createClient()
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const iso = (d: Date) => d.toISOString().slice(0, 10)

  const [{ data: stats }, { data: series }, { data: byCat }, { data: recentOrders }, { data: channels }, { data: prevOrders }] = await Promise.all([
    supabase.rpc('dashboard_stats'),
    supabase.rpc('revenue_series', { p_days: 210 }),
    supabase.rpc('sales_by_category', { p_from: iso(monthStart), p_to: iso(today) }),
    supabase.from('orders').select('id,order_number,customer_name,total,status,created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('orders').select('channel').gte('created_at', prevStart.toISOString()),
    supabase.from('orders').select('total,status,created_at').gte('created_at', prevStart.toISOString()).lt('created_at', monthStart.toISOString()),
  ])
  const s = (stats ?? {}) as Record<string, number>
  const paidPrev = (prevOrders ?? []).filter(o => !['cancelado', 'devolvido', 'pendente'].includes(o.status))
  const prevRevenue = paidPrev.reduce((a, o) => a + Number(o.total), 0)
  const rows = (series ?? []) as { day: string; revenue: number; orders: number }[]
  const monthly = new Map<string, { month: string; seen: number; sales: number }>()
  for (const r of rows) {
    const d = new Date(r.day); const k = `${d.getFullYear()}-${d.getMonth()}`
    const m = monthly.get(k) ?? { month: MONTHS[d.getMonth()], seen: 0, sales: 0 }
    m.seen += Number(r.orders); m.sales += Number(r.revenue); monthly.set(k, m)
  }
  const habits = Array.from(monthly.values())
  const thisMonthOrders = habits[habits.length - 1]?.seen ?? 0
  const cats = ((byCat ?? []) as { category: string; revenue: number; units: number }[]).map(c => ({ ...c, units: Number(c.units), revenue: Number(c.revenue) }))
  const soldUnits = cats.reduce((a, c) => a + c.units, 0)
  const channelCount = new Map<string, number>()
  for (const o of channels ?? []) channelCount.set(o.channel, (channelCount.get(o.channel) ?? 0) + 1)
  const bubbles = Array.from(channelCount.entries()).map(([k, v]) => ({ label: CHANNEL[k] ?? k, value: v })).sort((a, b) => b.value - a.value)

  const kpis = [
    { label: 'Total de vendas', value: formatKz(s.revenue_month), hint: 'Este mês vs mês anterior', delta: pct(s.revenue_month ?? 0, prevRevenue), icon: Receipt, primary: true },
    { label: 'Total de pedidos', value: String(thisMonthOrders), hint: 'Pedidos vs mês anterior', delta: pct(thisMonthOrders, paidPrev.length), icon: ShoppingCart },
    { label: 'Clientes', value: String(s.customers ?? 0), hint: `${s.orders_pending ?? 0} pedidos pendentes`, delta: null, icon: Users },
    { label: 'Produtos vendidos', value: String(soldUnits), hint: `${s.stock_units ?? 0} unidades em stock`, delta: null, icon: Package },
  ]

  return (
    <div className="dash">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold tracking-tight">Relatório de Vendas</h1><p className="text-sm text-ink-muted">{today.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1.1fr]">
        <div className="grid grid-cols-2 gap-4 xl:col-span-2">
          {kpis.map(k => (
            <div key={k.label} className={`dash-kpi ${k.primary ? 'dash-kpi-primary' : ''}`}>
              <div className="flex items-start justify-between">
                <span className="dash-icon"><k.icon className="h-4 w-4" /></span>
                {k.delta !== null && <span className={`dash-delta ${k.delta < 0 ? 'dash-delta-neg' : ''}`}>{k.delta >= 0 ? '+' : ''}{k.delta}%</span>}
              </div>
              <p className="mt-4 text-[13px] opacity-80">{k.label}</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3"><strong className="text-2xl font-semibold tabular tracking-tight">{k.value}</strong><span className="text-[11px] opacity-70">{k.hint}</span></div>
            </div>
          ))}

          <div className="dash-card col-span-2">
            <div className="flex items-start justify-between">
              <div><h2 className="font-semibold">Hábitos dos Clientes</h2><p className="text-xs text-ink-muted">Pedidos e vendas por mês</p></div>
              <span className="dash-chip">Este ano</span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-ink-muted"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-slate-300" /> Pedidos</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-brand-600" /> Vendas</span></div>
            <HabitsChart data={habits} />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="dash-card">
            <div className="flex items-start justify-between">
              <div><h2 className="font-semibold">Estatística de Produtos</h2><p className="text-xs text-ink-muted">Vendas por categoria</p></div>
              <span className="dash-chip">Este mês</span>
            </div>
            <CategoryRings data={cats} total={soldUnits} />
          </div>
          <div className="dash-card">
            <div className="flex items-start justify-between">
              <div><h2 className="font-semibold">Crescimento de Clientes</h2><p className="text-xs text-ink-muted">Pedidos por canal</p></div>
              <span className="dash-chip">60 dias</span>
            </div>
            <ChannelBubbles data={bubbles} />
          </div>
        </div>
      </div>

      <div className="dash-card mt-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Pedidos recentes</h2><Link href="/admin/pedidos" className="text-sm font-medium text-brand-700">Ver todos</Link></div>
        {!recentOrders?.length ? <p className="py-6 text-center text-sm text-ink-muted">Sem pedidos ainda</p> : (
          <ul className="mt-2 divide-y divide-line">
            {recentOrders.map(o => (
              <li key={o.id}>
                <Link href={`/admin/pedidos/${o.id}`} className="flex items-center justify-between py-3 text-sm hover:bg-surface/50">
                  <div className="min-w-0"><p className="truncate font-medium">{o.order_number} · {o.customer_name}</p><p className="text-xs text-ink-muted">{formatDateTime(o.created_at)}</p></div>
                  <div className="flex items-center gap-3"><span className="tabular font-medium">{formatKz(o.total)}</span><StatusBadge map={ORDER_STATUS} value={o.status} /></div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

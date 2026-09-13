import Link from 'next/link'
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Users, RefreshCw, Star, ListTodo } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard, PageHeader, Card, CardHeader, CardBody, StatusBadge, EmptyState } from '@/components/ui'
import { formatKz, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS } from '@/lib/labels'
import { RevenueChart } from './revenue-chart'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createClient()
  const [{ data: stats }, { data: series }, { data: recentOrders }, { data: lowStock }] = await Promise.all([
    supabase.rpc('dashboard_stats'),
    supabase.rpc('revenue_series', { p_days: 30 }),
    supabase.from('orders').select('id,order_number,customer_name,total,status,channel,created_at').order('created_at', { ascending: false }).limit(8),
    supabase.from('products').select('id,name,sku,stock_total,min_stock').eq('is_active', true).order('stock_total').limit(8),
  ])
  const s = (stats ?? {}) as Record<string, number>
  const low = (lowStock ?? []).filter((p) => (p.stock_total ?? 0) <= (p.min_stock ?? 0))

  return (
    <>
      <PageHeader title="Painel" description="Resumo operacional da loja em tempo real." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Receita hoje" value={formatKz(s.revenue_today)} icon={<TrendingUp className="h-4 w-4" />} tone="green" />
        <StatCard label="Receita este mês" value={formatKz(s.revenue_month)} icon={<TrendingUp className="h-4 w-4" />} tone="blue" />
        <StatCard label="Pedidos hoje" value={s.orders_today ?? 0} icon={<ShoppingCart className="h-4 w-4" />} hint={`${s.orders_pending ?? 0} pendentes`} href="/admin/pedidos" />
        <StatCard label="Produtos em stock" value={s.products_in_stock ?? 0} icon={<Package className="h-4 w-4" />} hint={`${s.stock_units ?? 0} unidades`} href="/admin/produtos" />
        <StatCard label="Stock baixo / esgotado" value={`${s.low_stock ?? 0} / ${s.out_of_stock ?? 0}`} icon={<AlertTriangle className="h-4 w-4" />} tone="amber" href="/admin/armazem" />
        <StatCard label="Clientes" value={s.customers ?? 0} icon={<Users className="h-4 w-4" />} href="/admin/clientes" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Receita — últimos 30 dias" />
          <CardBody><RevenueChart data={(series ?? []).map((d) => ({ day: d.day as string, revenue: Number(d.revenue), orders: Number(d.orders) }))} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Alertas" />
          <CardBody className="space-y-2.5 text-sm">
            <AlertRow href="/admin/pedidos" icon={<ShoppingCart className="h-4 w-4" />} n={s.orders_pending} label="pedidos pendentes" />
            <AlertRow href="/admin/trocas" icon={<RefreshCw className="h-4 w-4" />} n={s.trades_pending} label="trocas por avaliar" />
            <AlertRow href="/admin/avaliacoes" icon={<Star className="h-4 w-4" />} n={s.reviews_pending} label="avaliações por moderar" />
            <AlertRow href="/admin/tarefas" icon={<ListTodo className="h-4 w-4" />} n={s.tasks_pending} label="tarefas em aberto" />
            <AlertRow href="/admin/pontualidade" icon={<Users className="h-4 w-4" />} n={s.employees_present} label={`presentes hoje (${s.employees_late ?? 0} atrasados)`} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Pedidos recentes" action={<Link href="/admin/pedidos" className="text-sm font-medium text-brand-700">Ver todos</Link>} />
          <CardBody className="px-0 py-0">
            {!recentOrders?.length ? <EmptyState compact title="Sem pedidos ainda" /> : (
              <ul className="divide-y divide-line">
                {recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/pedidos/${o.id}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-surface/50">
                      <div className="min-w-0"><p className="truncate font-medium">{o.order_number} · {o.customer_name}</p><p className="text-xs text-ink-muted">{formatDateTime(o.created_at)}</p></div>
                      <div className="flex items-center gap-3"><span className="tabular font-medium">{formatKz(o.total)}</span><StatusBadge map={ORDER_STATUS} value={o.status} /></div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Stock crítico" action={<Link href="/admin/armazem" className="text-sm font-medium text-brand-700">Armazém</Link>} />
          <CardBody className="px-0 py-0">
            {low.length === 0 ? <EmptyState compact title="Stock sob controlo" /> : (
              <ul className="divide-y divide-line">
                {low.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                    <div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-xs text-ink-muted">{p.sku}</p></div>
                    <span className={`text-xs font-semibold tabular ${p.stock_total === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock_total}/{p.min_stock}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}

function AlertRow({ href, icon, n, label }: { href: string; icon: React.ReactNode; n?: number; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-md border border-line px-3 py-2.5 hover:bg-surface">
      <span className={n ? 'text-amber-600' : 'text-emerald-600'}>{icon}</span>
      <span className="flex-1"><strong className="tabular">{n ?? 0}</strong> {label}</span>
    </Link>
  )
}

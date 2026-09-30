'use client'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { formatKz } from '@/lib/utils'

const go = (href?: string) => { if (href) window.location.assign(href) }
const BLUE = '#1546b8'
const GREY = '#e5e7eb'
const PALETTE = [BLUE, '#ef4444', '#94a3b8', '#60a5fa', '#c7d2fe']

export function HabitsChart({ data }: { data: { month: string; seen: number; sales: number; href?: string }[] }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-ink-muted">Sem dados</p>
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={6} barCategoryGap="30%" margin={{ top: 8, right: 4, bottom: 0, left: -12 }} className="cursor-pointer" onClick={(e) => go((e?.activePayload?.[0]?.payload as { href?: string } | undefined)?.href)}>
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12, background: '#111', border: 0, color: 'white', fontSize: 12 }} itemStyle={{ color: 'white' }} labelStyle={{ color: '#d4d4d8' }}
            formatter={(v: number, name: string) => [name === 'sales' ? formatKz(v) : `${v} pedidos`, name === 'sales' ? 'Vendas' : 'Pedidos']} />
          <Bar dataKey="seen" fill={GREY} radius={[10, 10, 10, 10]} />
          <Bar dataKey="sales" fill={BLUE} radius={[10, 10, 10, 10]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryRings({ data, total }: { data: { category: string; units: number; revenue: number; href?: string }[]; total: number }) {
  const top = data.slice(0, 4)
  const rings = top.map((d, i) => ({ name: d.category, value: d.units, href: d.href, fill: PALETTE[i % PALETTE.length] })).reverse()
  return (
    <div>
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart data={rings} innerRadius="40%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={12}>
            <PolarAngleAxis type="number" domain={[0, Math.max(1, ...rings.map(r => r.value))]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} className="cursor-pointer" onClick={(d: { href?: string }) => go(d?.href)} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold tabular">{total}</p>
          <p className="text-[11px] text-ink-muted">produtos vendidos</p>
        </div>
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {top.map((d, i) => (
          <li key={d.category}>
            <a href={d.href ?? '/admin/produtos'} className="flex items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-surface">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="flex-1 truncate">{d.category}</span>
              <span className="tabular font-medium">{d.units}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 tabular">{formatKz(d.revenue)}</span>
            </a>
          </li>
        ))}
        {top.length === 0 && <li className="text-center text-xs text-ink-muted">Sem vendas no período</li>}
      </ul>
    </div>
  )
}

export function ChannelBubbles({ data }: { data: { label: string; value: number; href?: string }[] }) {
  const max = Math.max(1, ...data.map(d => d.value))
  const bubbles = data.slice(0, 4)
  const positions = [
    { left: '34%', top: '36%' }, { left: '8%', top: '52%' }, { left: '30%', top: '68%' }, { left: '54%', top: '62%' },
  ]
  const shades = [BLUE, '#3b6fd6', '#7ea2e8', '#bfd0f4']
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4">
      <div className="relative h-40">
        {bubbles.map((b, i) => {
          const size = 44 + Math.round(70 * (b.value / max))
          return <a key={b.label} href={b.href ?? '/admin/pedidos'} title={b.label} className="absolute grid place-items-center rounded-full text-xs font-semibold text-white transition-transform hover:scale-105" style={{ width: size, height: size, background: shades[i], ...positions[i] }}>{b.value}</a>
        })}
        {!bubbles.length && <p className="py-10 text-center text-xs text-ink-muted">Sem clientes</p>}
      </div>
      <ul className="space-y-2 self-center text-xs">
        {bubbles.map((b, i) => <li key={b.label}><a href={b.href ?? '/admin/pedidos'} className="flex items-center gap-2 hover:text-brand-700"><span className="h-3 w-3 rounded-sm" style={{ background: shades[i] }} />{b.label}</a></li>)}
      </ul>
    </div>
  )
}

'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatKz } from '@/lib/utils'

export function RevenueChart({ data }: { data: { day: string; revenue: number; orders: number }[] }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-ink-muted">Sem dados</p>
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1F5AE0" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1F5AE0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBEEF3" vertical={false} />
          <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(8)} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v: number) => (v >= 1_000_000 ? `${v / 1_000_000}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} tickLine={false} axisLine={false} width={48} />
          <Tooltip formatter={(v: number) => [formatKz(v), 'Receita']} labelFormatter={(d: string) => d} />
          <Area type="monotone" dataKey="revenue" stroke="#1F5AE0" strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

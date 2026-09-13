import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, CardHeader, CardBody, Table, THead, TBody, EmptyState } from '@/components/ui'
import { formatKz } from '@/lib/utils'
import { daysAgoISO, todayISO } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient()
  const from = searchParams.de ?? daysAgoISO(29)
  const to = searchParams.ate ?? todayISO()
  const [{ data: byCat }, { data: top }, { data: byEmp }, { data: fin }] = await Promise.all([
    supabase.rpc('sales_by_category', { p_from: from, p_to: to }),
    supabase.rpc('top_products', { p_from: from, p_to: to, p_limit: 10 }),
    supabase.rpc('sales_by_employee', { p_from: from, p_to: to }),
    supabase.rpc('financial_summary', { p_from: from, p_to: to }),
  ])
  const f = (fin ?? {}) as Record<string, number>
  return (
    <>
      <PageHeader title="Relatórios" description="Indicadores operacionais — não substituem contabilidade oficial."
        actions={<form className="flex items-center gap-2"><input type="date" name="de" defaultValue={from} className="h-10 rounded-md border border-line px-3 text-sm" /><input type="date" name="ate" defaultValue={to} className="h-10 rounded-md border border-line px-3 text-sm" /><button className="h-10 rounded-md bg-brand-600 px-4 text-sm font-medium text-white">Aplicar</button></form>} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-ink-muted">Receita</p><p className="mt-1 text-xl font-semibold tabular">{formatKz(f.revenue)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Pedidos</p><p className="mt-1 text-xl font-semibold tabular">{f.orders ?? 0}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Ticket médio</p><p className="mt-1 text-xl font-semibold tabular">{formatKz(f.orders ? f.revenue / f.orders : 0)}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Margem estimada</p><p className="mt-1 text-xl font-semibold tabular">{formatKz((f.revenue ?? 0) - (f.cogs ?? 0))}</p></Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Vendas por categoria" />
          <Table>
            <THead><tr><th>Categoria</th><th className="text-right">Unidades</th><th className="text-right">Receita</th></tr></THead>
            <TBody>{(byCat ?? []).map((r, i) => <tr key={i}><td className="font-medium">{r.category}</td><td className="text-right tabular">{r.units}</td><td className="text-right tabular">{formatKz(r.revenue)}</td></tr>)}</TBody>
          </Table>
          {!byCat?.length && <EmptyState compact title="Sem vendas no período" />}
        </Card>
        <Card>
          <CardHeader title="Top produtos" />
          <Table>
            <THead><tr><th>Produto</th><th className="text-right">Unid.</th><th className="text-right">Receita</th></tr></THead>
            <TBody>{(top ?? []).map((r, i) => <tr key={i}><td className="font-medium">{r.name}</td><td className="text-right tabular">{r.units}</td><td className="text-right tabular">{formatKz(r.revenue)}</td></tr>)}</TBody>
          </Table>
          {!top?.length && <EmptyState compact title="Sem vendas no período" />}
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Vendas por funcionário" />
          <Table>
            <THead><tr><th>Funcionário</th><th className="text-right">Pedidos</th><th className="text-right">Receita</th></tr></THead>
            <TBody>{(byEmp ?? []).map((r, i) => <tr key={i}><td className="font-medium">{r.seller}</td><td className="text-right tabular">{r.orders}</td><td className="text-right tabular">{formatKz(r.revenue)}</td></tr>)}</TBody>
          </Table>
          {!byEmp?.length && <EmptyState compact title="Sem vendas registadas por funcionário" />}
        </Card>
      </div>
    </>
  )
}

'use client'
import * as React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PackageSearch, CheckCircle2 } from 'lucide-react'
import { Button, Field, Input, Card, CardBody, StatusBadge } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatKz, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS } from '@/lib/labels'
import type { OrderStatus } from '@/lib/labels'

type Lookup = {
  order_number: string; status: OrderStatus; total: number; created_at: string
  items?: { product_name: string; quantity: number; unit_price: number }[]
  history?: { status: OrderStatus; note: string | null; created_at: string }[]
}

function LookupInner() {
  const params = useSearchParams()
  const [n, setN] = React.useState(params.get('n') ?? '')
  const [t, setT] = React.useState(params.get('t') ?? '')
  const [loading, setLoading] = React.useState(false)
  const [res, setRes] = React.useState<Lookup | null>(null)
  const [error, setError] = React.useState('')

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!n.trim() || !t.trim()) return
    setLoading(true); setError(''); setRes(null)
    const supabase = createClient()
    const { data, error: err } = await supabase.rpc('lookup_order', { p_number: n.trim(), p_phone: t.trim() })
    setLoading(false)
    if (err || !data) { setError('Pedido não encontrado. Confirma o número e o telefone.'); return }
    setRes(data as Lookup)
  }
  React.useEffect(() => { if (n && t) search() }, []) // eslint-disable-line

  return (
    <div className="shell max-w-2xl py-12">
      <div className="mb-8 text-center">
        <PackageSearch className="mx-auto h-8 w-8 text-brand-600" />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Acompanhar pedido</h1>
        <p className="mt-2 text-ink-muted">Introduz o número do pedido e o telefone usado na compra.</p>
      </div>
      <Card>
        <CardBody>
          <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
            <Field className="flex-1"><Input placeholder="Número do pedido (ex.: GAT-2024-0001)" value={n} onChange={(e) => setN(e.target.value)} /></Field>
            <Field className="flex-1"><Input placeholder="Telefone" value={t} onChange={(e) => setT(e.target.value)} /></Field>
            <Button type="submit" loading={loading}>Procurar</Button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </CardBody>
      </Card>
      {res && (
        <Card className="mt-6">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{res.order_number}</p>
                <p className="text-xs text-ink-muted">{formatDateTime(res.created_at)}</p>
              </div>
              <StatusBadge map={ORDER_STATUS} value={res.status} />
            </div>
            {res.items && res.items.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {res.items.map((i, idx) => <li key={idx} className="flex justify-between"><span>{i.product_name} ×{i.quantity}</span><span className="tabular">{formatKz(i.unit_price * i.quantity)}</span></li>)}
              </ul>
            )}
            <p className="mt-3 flex justify-between border-t border-line pt-3 font-semibold"><span>Total</span><span className="tabular">{formatKz(res.total)}</span></p>
            {res.history && res.history.length > 0 && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Histórico</p>
                <ul className="mt-2 space-y-2">
                  {res.history.map((h, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="flex-1">{ORDER_STATUS[h.status]?.label ?? h.status}{h.note ? ` — ${h.note}` : ''}</span>
                      <span className="text-xs text-ink-muted">{formatDateTime(h.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default function OrderLookupPage() {
  return <Suspense fallback={null}><LookupInner /></Suspense>
}

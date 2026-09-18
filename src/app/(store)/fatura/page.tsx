'use client'
import * as React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Printer } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatKz, formatDate } from '@/lib/utils'
import { ORDER_STATUS } from '@/lib/labels'
import type { OrderStatus } from '@/lib/labels'
import { WHATSAPP_NUMBER } from '@/lib/whatsapp'

type Invoice = {
  order_number: string; status: OrderStatus; payment_status: string; total: number; subtotal: number
  discount: number; delivery_fee: number; delivery_method: string; created_at: string; customer_name: string | null
  items: { name: string; quantity: number; unit_price: number; total: number }[]
}

function InvoiceInner() {
  const params = useSearchParams()
  const n = params.get('n') ?? ''
  const t = params.get('t') ?? ''
  const [inv, setInv] = React.useState<Invoice | null>(null)
  const [state, setState] = React.useState<'loading' | 'ok' | 'error'>('loading')

  React.useEffect(() => {
    if (!n || !t) { setState('error'); return }
    createClient().rpc('lookup_order', { p_number: n, p_phone: t }).then(({ data, error }) => {
      if (error || !data) { setState('error'); return }
      setInv(data as Invoice); setState('ok')
    })
  }, [n, t])

  if (state === 'loading') return <div className="shell py-16 text-center text-sm text-ink-muted">A preparar a fatura…</div>
  if (state === 'error' || !inv) return <div className="shell py-16 text-center"><p>Fatura não encontrada.</p><ButtonLink href="/pedido" className="mt-4">Acompanhar pedido</ButtonLink></div>

  const issued = new Date(inv.created_at)
  const due = new Date(issued.getTime() + 3 * 86400000)
  const paid = inv.payment_status === 'pago'
  const ref = inv.order_number.replace(/\D/g, '').padStart(9, '0')

  return (
    <div className="shell max-w-3xl py-8">
      <div className="invoice-actions mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Apresenta esta fatura na loja física para levantar ou pagar o teu pedido.</p>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Imprimir / Guardar PDF</Button>
      </div>

      <article className="invoice">
        <header className="invoice-head">
          <Image src="/brand/logo.png" alt="Gilberto Aqui Tem" width={190} height={90} className="h-14 w-auto object-contain" priority />
          <div className="invoice-meta">
            <p><strong>Área de Cliente</strong></p>
            <p>Apoio ao cliente e faturação</p>
            <p>+{WHATSAPP_NUMBER} (WhatsApp)</p>
            <p>Telemóvel &amp; Acessórios</p>
          </div>
          <p className="invoice-page">Pág. 1/1</p>
        </header>

        <section className="invoice-top">
          <div>
            <h1>Fatura</h1>
            <dl>
              <dt>Nº Fatura:</dt><dd><strong>FT GAT/{ref}</strong></dd>
              <dt>Nº Referência:</dt><dd>{ref}</dd>
              <dt>Data de Emissão:</dt><dd>{formatDate(inv.created_at)}</dd>
              <dt>Nº Pedido:</dt><dd>{inv.order_number}</dd>
              <dt>Cliente:</dt><dd>{inv.customer_name ?? '—'}</dd>
              <dt>Telefone:</dt><dd>{t}</dd>
              <dt>Entrega:</dt><dd>{inv.delivery_method === 'entrega' ? 'Entrega ao domicílio' : 'Levantamento na loja'}</dd>
            </dl>
          </div>
          <div className="invoice-address">
            <p className="invoice-barcode" aria-hidden="true">{ref}</p>
            <p><strong>{(inv.customer_name ?? 'CLIENTE').toUpperCase()}</strong></p>
            <p>{inv.order_number}</p>
            <p>GILBERTO AQUI TEM — LOJA FÍSICA</p>
            <p>ANGOLA</p>
          </div>
        </section>

        <section className="invoice-strip">
          <div className="invoice-strip-title"><strong>Fatura</strong><span>{issued.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</span></div>
          <div className="invoice-strip-dark"><span>Data Limite de Pagamento</span><strong>{formatDate(due.toISOString())}</strong></div>
          <div className="invoice-strip-dark"><span>Valor a Pagar</span><strong>{paid ? 'Pago' : formatKz(inv.total)}</strong></div>
        </section>

        <table className="invoice-table">
          <thead><tr><th>Fatura</th><th>Qtd</th><th>Valor (Kz)</th><th>Total (Kz)</th></tr></thead>
          <tbody>
            <tr className="invoice-group"><td colSpan={4}>PRODUTOS</td></tr>
            {inv.items.map((i, idx) => <tr key={idx}><td>{i.name}</td><td>{i.quantity}</td><td>{formatKz(i.unit_price)}</td><td>{formatKz(i.total)}</td></tr>)}
            {inv.discount > 0 && <tr><td>Desconto</td><td /><td /><td>-{formatKz(inv.discount)}</td></tr>}
            {inv.delivery_fee > 0 && <tr><td>Taxa de entrega</td><td /><td /><td>{formatKz(inv.delivery_fee)}</td></tr>}
            <tr className="invoice-total"><td>Total da fatura</td><td /><td /><td>{formatKz(inv.total)}</td></tr>
          </tbody>
        </table>

        <section className="invoice-extract">
          <h2>Extrato de Conta</h2>
          <p><span>Fatura nº FT GAT/{ref}</span><span>{formatKz(inv.total)}</span></p>
          <p><span>Estado do pedido</span><span>{ORDER_STATUS[inv.status]?.label ?? inv.status}</span></p>
          <p className="invoice-extract-total"><span>Valor a Pagar</span><span>{paid ? '0 Kz' : formatKz(inv.total)}</span></p>
        </section>

        <section className="invoice-boxes">
          <div><h3>Pagamento na loja</h3><p>Apresenta esta fatura (impressa ou no telemóvel) ao balcão da Gilberto Aqui Tem. Aceitamos numerário, Multicaixa e transferência.</p></div>
          <div><h3>Referência</h3><p>Pedido <strong>{inv.order_number}</strong><br />Montante <strong>{formatKz(inv.total)}</strong></p></div>
          <div><h3>Apoio</h3><p>WhatsApp +{WHATSAPP_NUMBER}. Guarda esta fatura como comprovativo do teu pedido.</p></div>
        </section>

        <div className="invoice-stamp" aria-label="Carimbo Gilberto Aqui Tem">
          <Image src="/brand/logo.png" alt="" width={120} height={56} className="h-8 w-auto object-contain" />
          <strong>GILBERTO AQUI TEM</strong>
          <span>Telemóvel &amp; Acessórios</span>
          <span>{inv.order_number} · {formatDate(inv.created_at)}</span>
          <em>{paid ? 'PAGO' : 'ORIGINAL'}</em>
        </div>

        <footer className="invoice-foot">Documento gerado electronicamente em gilberto-aqui-tem.netlify.app · Processado por programa informático</footer>
      </article>
    </div>
  )
}

export default function InvoicePage() {
  return <Suspense fallback={null}><InvoiceInner /></Suspense>
}

import { NextResponse } from 'next/server'
import { formatKz } from '@/lib/utils'

type Item = { name: string; qty: number; price: number; image?: string | null }
type Body = {
  kind?: 'confirmado' | 'entregue'
  to: string
  name: string
  number: string
  total: number
  subtotal?: number
  delivery?: string
  address?: string | null
  payment?: string
  phone?: string
  items?: Item[]
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://gilbertoaquitem.com'
const SENDER = process.env.BREVO_SENDER || 'Gilberto Aqui Tem <noreply@gilbertoaquitem.com>'
const LOGO = `${SITE}/brand/logo.png`

function esc(s: string | null | undefined) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function itemRow(i: Item) {
  const img = i.image
    ? `<img src="${esc(i.image)}" alt="" width="64" height="64" style="width:64px;height:64px;object-fit:contain;border-radius:10px;border:1px solid #eee;background:#fff" />`
    : `<div style="width:64px;height:64px;border-radius:10px;background:#f4f4f6"></div>`
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid #eee">${img}</td>
    <td style="padding:14px 12px;border-bottom:1px solid #eee;vertical-align:top">
      <div style="font-weight:600;color:#1f2937">${esc(i.name)}</div>
      <div style="color:#6b7280;font-size:13px;margin-top:4px">Quantidade: ${i.qty}</div>
    </td>
    <td style="padding:14px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#111;white-space:nowrap">${formatKz(i.price * i.qty)}</td>
  </tr>`
}

function html(b: Body) {
  const items = (b.items ?? []).map(itemRow).join('')
  const delivery = b.delivery === 'entrega' ? 'Entrega ao domicílio' : 'Levantamento na loja'
  const invoice = `${SITE}/fatura?n=${encodeURIComponent(b.number)}&t=${encodeURIComponent(b.phone ?? '')}`
  const entregue = b.kind === 'entregue'
  const heading = entregue ? 'O teu produto foi entregue!' : 'Woohoo! O teu pedido está confirmado.'
  const lead = entregue
    ? `O teu pedido <strong>${esc(b.number)}</strong> já foi entregue pela <strong>Gilberto Aqui Tem</strong>.<br/>Esperamos que gostes da tua compra — e obrigado pela preferência.`
    : `A <strong>Gilberto Aqui Tem</strong> já recebeu o teu pedido <strong>${esc(b.number)}</strong> e vai começar a prepará-lo.<br/>Entramos em contacto contigo no WhatsApp para confirmar.`
  const cta = entregue ? 'Baixar a tua fatura' : 'Ver o teu pedido'
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="text-align:center;padding:18px 0"><img src="${LOGO}" alt="Gilberto Aqui Tem" width="170" style="max-width:170px" /></div>
    <div style="background:#fff;border-radius:16px;padding:32px 28px;border:1px solid #ececf0">
      <h1 style="margin:0 0 10px;font-size:24px;color:#111;text-align:center">${heading}</h1>
      <p style="margin:0 0 22px;color:#4b5563;text-align:center;font-size:14px">${lead}</p>

      <div style="text-align:center;margin:6px 0 26px">
        <a href="${invoice}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:700;padding:13px 30px;border-radius:999px;font-size:14px">${cta}</a>
      </div>

      <h2 style="font-size:16px;color:#111;margin:0 0 6px">Detalhes do pedido</h2>
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px">Referência: <strong>${esc(b.number)}</strong></p>
      <table style="width:100%;border-collapse:collapse">${items}</table>

      <table style="width:100%;margin-top:18px;font-size:14px">
        <tr>
          <td style="vertical-align:top;color:#6b7280;font-size:13px">
            <strong style="color:#111">Entrega</strong><br/>${delivery}${b.address ? `<br/>${esc(b.address)}` : ''}
          </td>
          <td style="vertical-align:top;text-align:right;color:#6b7280;font-size:13px">
            <strong style="color:#111">Pagamento</strong><br/>${esc(b.payment ?? '')}
          </td>
        </tr>
      </table>

      <div style="margin-top:18px;padding-top:16px;border-top:1px solid #eee;text-align:right">
        <span style="color:#6b7280;font-size:14px">Total</span>
        <span style="font-size:22px;font-weight:800;color:#1546B8;margin-left:12px">${formatKz(b.total)}</span>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin:18px 0">
      Dúvidas? Fala connosco no WhatsApp <a href="https://wa.me/244926719714" style="color:#1546B8">+244 926 719 714</a><br/>
      Gilberto Aqui Tem · Luanda
    </p>
  </div></body></html>`
}

export async function POST(req: Request) {
  const key = process.env.BREVO_API_KEY
  if (!key) return NextResponse.json({ error: 'BREVO_API_KEY não configurada' }, { status: 503 })
  let b: Body
  try { b = await req.json() } catch { return NextResponse.json({ error: 'body inválido' }, { status: 400 }) }
  if (!b.to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.to)) return NextResponse.json({ error: 'email inválido' }, { status: 400 })
  if (!b.number || !b.total) return NextResponse.json({ error: 'dados em falta' }, { status: 400 })

  const senderMatch = SENDER.match(/^(.*)<(.+)>\s*$/)
  const sender = senderMatch ? { name: senderMatch[1].trim(), email: senderMatch[2].trim() } : { name: 'Gilberto Aqui Tem', email: SENDER }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender,
      to: [{ email: b.to, name: b.name || b.to }],
      subject: b.kind === 'entregue' ? `Pedido ${b.number} entregue — Gilberto Aqui Tem` : `Pedido ${b.number} confirmado — Gilberto Aqui Tem`,
      htmlContent: html(b),
    }),
  })
  if (!res.ok) {
    const detail = await res.text()
    return NextResponse.json({ error: 'Brevo recusou', detail }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}

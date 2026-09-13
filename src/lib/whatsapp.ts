import { formatKz } from './utils'

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '244926719714'
export const WHATSAPP_DISPLAY = '+244 926 719 714'

export function waLink(message?: string, number: string = WHATSAPP_NUMBER) {
  const base = `https://wa.me/${number.replace(/\D/g, '')}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function productMessage(p: { name: string; price: number; storage?: string | null; color?: string | null; condition?: string | null; sku?: string | null }, url?: string) {
  const details = [p.storage, p.color, p.condition].filter(Boolean).join(' · ')
  return [
    `Olá Gilberto Aqui Tem! 👋`,
    `Tenho interesse neste produto:`,
    ``,
    `*${p.name}*${details ? `\n${details}` : ''}`,
    `Preço: ${formatKz(p.price)}`,
    p.sku ? `Ref: ${p.sku}` : '',
    url ? `\n${url}` : '',
    ``,
    `Ainda está disponível?`,
  ].filter((l) => l !== '').join('\n')
}

export function cartMessage(items: { name: string; quantity: number; price: number }[], total: number, customer?: { name?: string; phone?: string; delivery?: string; address?: string }) {
  const lines = items.map((i) => `• ${i.quantity}x ${i.name} — ${formatKz(i.price * i.quantity)}`)
  return [
    `Olá Gilberto Aqui Tem! Quero fazer este pedido:`,
    ``,
    ...lines,
    ``,
    `*Total: ${formatKz(total)}*`,
    customer?.name ? `\nNome: ${customer.name}` : '',
    customer?.phone ? `Telefone: ${customer.phone}` : '',
    customer?.delivery ? `Entrega: ${customer.delivery}` : '',
    customer?.address ? `Morada: ${customer.address}` : '',
  ].filter((l) => l !== '').join('\n')
}

export function orderMessage(orderNumber: string, total: number, name: string) {
  return `Olá! Acabei de fazer o pedido *${orderNumber}* no site (${formatKz(total)}). Nome: ${name}. Podem confirmar a disponibilidade e forma de pagamento?`
}

export function tradeMessage(t: { brand: string; model: string; storage?: string | null; condition?: string | null; battery?: number | null; expected?: number | null }) {
  return [
    `Olá Gilberto Aqui Tem! Quero trocar/vender o meu aparelho:`,
    ``,
    `*${t.brand} ${t.model}*`,
    t.storage ? `Armazenamento: ${t.storage}` : '',
    t.condition ? `Estado: ${t.condition}` : '',
    t.battery ? `Bateria: ${t.battery}%` : '',
    t.expected ? `Valor esperado: ${formatKz(t.expected)}` : '',
    ``,
    `Quanto me oferecem?`,
  ].filter((l) => l !== '').join('\n')
}

export function supportMessage() {
  return `Olá Gilberto Aqui Tem! Preciso de ajuda com uma compra.`
}

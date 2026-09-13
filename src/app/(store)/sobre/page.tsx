import { ShieldCheck, RefreshCw, MessageCircle, BadgeCheck } from 'lucide-react'
import { ButtonLink } from '@/components/ui'
import { waLink, supportMessage, WHATSAPP_DISPLAY } from '@/lib/whatsapp'

export const metadata = { title: 'Sobre' }

export default function AboutPage() {
  return (
    <div className="shell max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Sobre nós</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Gilberto Aqui Tem — Telemóvel &amp; Acessórios</h1>
      <p className="mt-4 text-lg text-ink-soft leading-relaxed">Somos uma loja angolana de tecnologia: telemóveis, laptops, PlayStation e acessórios. <strong>Compramos, vendemos e trocamos</strong> — e tratamos cada cliente directamente, sem intermediários.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          { icon: ShieldCheck, t: 'Garantia em todos os aparelhos', d: 'Novos, usados ou recondicionados — cada produto tem garantia definida na ficha.' },
          { icon: BadgeCheck, t: 'Usados inspeccionados', d: 'Avaliamos bateria, ecrã, funcionamento e estado físico antes de vender.' },
          { icon: RefreshCw, t: 'Programa de trocas', d: 'Traz o teu aparelho antigo, recebe avaliação justa e paga só a diferença.' },
          { icon: MessageCircle, t: 'Atendimento directo', d: `Fala connosco no WhatsApp ${WHATSAPP_DISPLAY} — respondemos rápido.` },
        ].map((f) => (
          <div key={f.t} className="rounded-lg border border-line p-5">
            <f.icon className="h-5 w-5 text-brand-600" />
            <h3 className="mt-3 font-semibold">{f.t}</h3>
            <p className="mt-1 text-sm text-ink-muted">{f.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-lg bg-surface p-6 text-center">
        <p className="font-medium">Visita-nos em Luanda ou fala connosco online.</p>
        <div className="mt-4 flex justify-center gap-3">
          <ButtonLink href="/loja">Ver produtos</ButtonLink>
          <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="inline-flex h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-medium hover:bg-surface">WhatsApp {WHATSAPP_DISPLAY}</a>
        </div>
      </div>
    </div>
  )
}

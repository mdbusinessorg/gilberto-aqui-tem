import Link from '@/components/ui/navigation-link'
import { Instagram, Facebook, MessageCircle, MapPin, Clock } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { NewsletterBar } from './newsletter'
import { waLink, supportMessage, WHATSAPP_DISPLAY } from '@/lib/whatsapp'
import type { NavCategory } from './header'

export function StoreFooter({ categories, settings }: { categories: NavCategory[]; settings: { address?: string; hours?: string; instagram?: string; facebook?: string } }) {
  return (
    <footer className="store-footer mt-10 border-t border-line bg-white">
      <NewsletterBar />
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-4 text-sm text-ink-muted leading-relaxed">Telemóveis, laptops, PlayStation e acessórios. Compramos, vendemos e trocamos — com garantia e atendimento directo.</p>
          <div className="mt-5 flex items-center gap-2">
            <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="rounded-md border border-line bg-white p-2 text-ink-soft hover:text-[#25D366]" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
            <a href={`https://instagram.com/${(settings.instagram || 'Gilberto_Aqui_Tem').replace('@', '')}`} target="_blank" rel="noopener" className="rounded-md border border-line bg-white p-2 text-ink-soft hover:text-brand-600" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href={settings.facebook || 'https://facebook.com'} target="_blank" rel="noopener" className="rounded-md border border-line bg-white p-2 text-ink-soft hover:text-brand-600" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink">Categorias</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            {categories.map((c) => <li key={c.slug}><Link href={`/categoria/${c.slug}`} className="hover:text-ink">{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink">Ajuda</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/trocas" className="hover:text-ink">Trocar o meu dispositivo</Link></li>
            <li><Link href="/pedido" className="hover:text-ink">Acompanhar pedido</Link></li>
            <li><Link href="/conta" className="hover:text-ink">A minha conta</Link></li>
            <li><Link href="/sobre" className="hover:text-ink">Sobre a loja</Link></li>
            <li><Link href="/contacto" className="hover:text-ink">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink">Contacto</h4>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-muted">
            <li className="flex gap-2"><MessageCircle className="h-4 w-4 mt-0.5 shrink-0" /><a href={waLink(supportMessage())} target="_blank" rel="noopener" className="hover:text-ink">{WHATSAPP_DISPLAY}</a></li>
            {settings.address && <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /><span>{settings.address}</span></li>}
            {settings.hours && <li className="flex gap-2"><Clock className="h-4 w-4 mt-0.5 shrink-0" /><span>{settings.hours}</span></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Gilberto Aqui Tem · Telemóvel &amp; Acessórios · Angola</span>
          <span>Preços em Kwanza (Kz). Stock e preços actualizados em tempo real.</span>
        </div>
      </div>
    </footer>
  )
}

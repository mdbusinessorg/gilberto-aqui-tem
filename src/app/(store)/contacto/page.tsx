import { MessageCircle, Instagram, Facebook, MapPin, Clock, Mail } from 'lucide-react'
import { Card, CardBody } from '@/components/ui'
import { waLink, supportMessage, WHATSAPP_DISPLAY } from '@/lib/whatsapp'
import { getPublicSettings } from '@/lib/store/queries'

export const metadata = { title: 'Contacto' }

export default async function ContactPage() {
  const { store } = await getPublicSettings()
  return (
    <div className="shell max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Contacto</h1>
      <p className="mt-2 text-ink-muted">Estamos disponíveis para ajudar — escolhe o canal que preferires.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="group rounded-lg border border-line p-5 transition-colors hover:border-brand-300">
          <MessageCircle className="h-6 w-6 text-[#25D366]" />
          <h3 className="mt-3 font-semibold group-hover:text-brand-700">WhatsApp</h3>
          <p className="mt-1 text-sm text-ink-muted">{WHATSAPP_DISPLAY} — resposta mais rápida</p>
        </a>
        <a href={`https://instagram.com/${store.instagram.replace('@', '')}`} target="_blank" rel="noopener" className="group rounded-lg border border-line p-5 transition-colors hover:border-brand-300">
          <Instagram className="h-6 w-6 text-brand-600" />
          <h3 className="mt-3 font-semibold group-hover:text-brand-700">Instagram</h3>
          <p className="mt-1 text-sm text-ink-muted">@{store.instagram.replace('@', '')}</p>
        </a>
        {store.facebook && (
          <a href={store.facebook.startsWith('http') ? store.facebook : `https://facebook.com/${store.facebook}`} target="_blank" rel="noopener" className="group rounded-lg border border-line p-5 transition-colors hover:border-brand-300">
            <Facebook className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-semibold group-hover:text-brand-700">Facebook</h3>
            <p className="mt-1 text-sm text-ink-muted">{store.facebook}</p>
          </a>
        )}
        {store.email && (
          <a href={`mailto:${store.email}`} className="group rounded-lg border border-line p-5 transition-colors hover:border-brand-300">
            <Mail className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-semibold group-hover:text-brand-700">Email</h3>
            <p className="mt-1 text-sm text-ink-muted">{store.email}</p>
          </a>
        )}
      </div>
      <Card className="mt-6">
        <CardBody className="space-y-3 text-sm">
          {store.address && <p className="flex items-center gap-2 text-ink-soft"><MapPin className="h-4 w-4 text-brand-600" /> {store.address}</p>}
          {store.hours && <p className="flex items-center gap-2 text-ink-soft"><Clock className="h-4 w-4 text-brand-600" /> {store.hours}</p>}
        </CardBody>
      </Card>
    </div>
  )
}

import { MessageCircle } from 'lucide-react'
import { waLink, supportMessage } from '@/lib/whatsapp'

export function WhatsAppFloat() {
  return (
    <a href={waLink(supportMessage())} target="_blank" rel="noopener" aria-label="Falar no WhatsApp"
      className="wa-float fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-pop transition-transform hover:scale-105 sm:bottom-6 sm:right-6">
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}

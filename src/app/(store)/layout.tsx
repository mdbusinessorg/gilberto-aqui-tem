import { StoreHeader } from '@/components/store/header'
import { StoreFooter } from '@/components/store/footer'
import { CartProvider } from '@/components/store/cart-context'
import { getCategories, getPublicSettings } from '@/lib/store/queries'
import { getSessionProfile } from '@/lib/supabase/server'
import { STAFF_ROLES } from '@/lib/labels'
import { WhatsAppFloat } from '@/components/store/whatsapp-float'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings, session] = await Promise.all([getCategories(), getPublicSettings(), getSessionProfile()])
  const nav = categories.filter((c) => !c.parent_id).map((c) => ({ name: c.name, slug: c.slug }))
  const user = session.profile ? { name: session.profile.full_name, isStaff: STAFF_ROLES.includes(session.profile.role) } : null
  return (
    <CartProvider>
      <div className="storefront flex min-h-screen flex-col">
        <StoreHeader categories={nav} user={user} />
        <main className="flex-1">{children}</main>
        <StoreFooter categories={nav} settings={settings.store} />
        <WhatsAppFloat />
      </div>
    </CartProvider>
  )
}

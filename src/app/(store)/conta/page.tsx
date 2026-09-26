import Link from '@/components/ui/navigation-link'
import { redirect } from 'next/navigation'
import { Package, Heart, RefreshCw } from 'lucide-react'
import { getSessionProfile, createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardBody, StatusBadge, EmptyState } from '@/components/ui'
import { ORDER_STATUS, TRADE_STATUS, TIER } from '@/lib/labels'
import { formatKz, formatDateTime, formatDate } from '@/lib/utils'
import { ProductCard } from '@/components/store/product-card'
import { getPublicSettings, type StorefrontProduct } from '@/lib/store/queries'
import { SignOutButton } from './sign-out'
import { WheelSection } from './wheel'
import { RedeemCard } from './redeem'
import { ClockCamera } from '@/components/admin/clock-camera'
import { STAFF_ROLES } from '@/lib/labels'
import { todayISO } from '@/lib/utils'

export const metadata = { title: 'A minha conta' }
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const { user, profile } = await getSessionProfile()
  if (!user || !profile) redirect('/entrar?next=/conta')
  const supabase = createClient()
  const settings = await getPublicSettings()

  const { data: customer } = await supabase.from('customers').select('*').eq('profile_id', user.id).maybeSingle()
  const [{ data: orders }, { data: wishlist }, { data: trades }] = await Promise.all([
    customer
      ? supabase.from('orders').select('id,order_number,status,total,created_at').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
    supabase.from('wishlists').select('product_id').eq('profile_id', user.id),
    supabase.from('trade_requests').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  const isStaff = STAFF_ROLES.includes(profile.role)
  const { data: employee } = isStaff ? await supabase.from('employees').select('id,full_name,department,schedule_start,schedule_end').eq('profile_id', user.id).maybeSingle() : { data: null }
  const { data: todayAtt } = employee ? await supabase.from('attendance').select('*').eq('employee_id', employee.id).eq('work_date', todayISO()).maybeSingle() : { data: null }
  const tier = (customer?.tier ?? 'bronze') as keyof typeof TIER
  const points = customer?.loyalty_points ?? 0

  return (
    <div className="shell max-w-4xl py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Olá, {profile.full_name?.split(' ')[0] || 'cliente'}</h1>
          <p className="mt-1 text-sm text-ink-muted">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {employee && (
        <Card className="mb-6 border-brand-200 bg-brand-50/40 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="text-base font-semibold">Registo de ponto</h2><p className="text-xs text-ink-muted">{employee.department} · horário {String(employee.schedule_start).slice(0, 5)}–{String(employee.schedule_end).slice(0, 5)} · só tu e a gestão vêem este registo</p></div>
            <Link href="/admin/pontualidade" className="text-sm font-medium text-brand-700">Ver o meu histórico</Link>
          </div>
          <ClockCamera employeeId={employee.id} today={todayAtt} />
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-ink-muted">Pontos de fidelidade</p><p className="mt-1 text-2xl font-semibold tabular">{points}</p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Nível</p><p className="mt-1"><StatusBadge map={TIER} value={tier} /></p></Card>
        <Card className="p-4"><p className="text-xs text-ink-muted">Total gasto</p><p className="mt-1 text-2xl font-semibold tabular">{formatKz(customer?.total_spent ?? 0)}</p></Card>
      </div>

      {settings.wheel.enabled && <WheelSection />}
      {settings.loyalty.enabled && settings.loyalty.kz_per_point > 0 && points >= settings.loyalty.min_redeem_points && (
        <RedeemCard points={points} min={settings.loyalty.min_redeem_points} kzPerPoint={settings.loyalty.kz_per_point} />
      )}

      <Card className="mt-6">
        <CardHeader title="Os meus pedidos" />
        <CardBody>
          {!orders || orders.length === 0 ? <EmptyState compact icon={<Package className="h-5 w-5" />} title="Ainda não tens pedidos" action={<Link href="/loja" className="text-sm font-medium text-brand-700">Ir à loja</Link>} /> : (
            <ul className="divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div><p className="font-medium">{o.order_number}</p><p className="text-xs text-ink-muted">{formatDateTime(o.created_at)}</p></div>
                  <div className="flex items-center gap-4"><span className="tabular font-medium">{formatKz(o.total)}</span><StatusBadge map={ORDER_STATUS} value={o.status} /></div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={<span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" /> Favoritos</span>} />
          <CardBody><WishlistItems ids={(wishlist ?? []).map((w) => w.product_id!).filter(Boolean)} /></CardBody>
        </Card>
        <Card>
          <CardHeader title={<span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Os meus pedidos de troca</span>} />
          <CardBody>
            {!trades || trades.length === 0 ? <EmptyState compact title="Sem trocas" action={<Link href="/trocas" className="text-sm font-medium text-brand-700">Pedir avaliação</Link>} /> : (
              <ul className="divide-y divide-line">
                {trades.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                    <div><p className="font-medium">{t.brand} {t.model}</p><p className="text-xs text-ink-muted">{formatDate(t.created_at)}</p></div>
                    <div className="text-right"><StatusBadge map={TRADE_STATUS} value={t.status} />{t.final_offer && <p className="mt-1 text-xs tabular">{formatKz(t.final_offer)}</p>}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

async function WishlistItems({ ids }: { ids: string[] }) {
  if (ids.length === 0) return <EmptyState compact title="Sem favoritos" description="Toca no coração num produto para o guardar." />
  const supabase = createClient()
  const { data } = await supabase.from('storefront_products').select('*').in('id', ids)
  if (!data?.length) return <EmptyState compact title="Sem favoritos" />
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{(data as StorefrontProduct[]).map((p) => <ProductCard key={p.id} p={p} compact />)}</div>
}

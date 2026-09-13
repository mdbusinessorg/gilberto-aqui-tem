import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, CardHeader, CardBody, Table, THead, TBody, Badge, EmptyState } from '@/components/ui'
import { formatKz, formatDate } from '@/lib/utils'
import { CouponForm, BannerForm } from './forms'

export const dynamic = 'force-dynamic'

export default async function PromotionsPage() {
  const supabase = createClient()
  const [{ data: coupons }, { data: banners }, { data: promotions }] = await Promise.all([
    supabase.from('coupons').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('banners').select('*').order('sort_order'),
    supabase.from('promotions').select('*').order('created_at', { ascending: false }).limit(20),
  ])
  return (
    <>
      <PageHeader title="Promoções" description="Cupões, banners e campanhas." actions={<div className="flex gap-2"><CouponForm /><BannerForm /></div>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Cupões" />
          <Table>
            <THead><tr><th>Código</th><th>Desconto</th><th>Usos</th><th>Expira</th><th>Estado</th></tr></THead>
            <TBody>
              {(coupons ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="font-mono text-sm font-medium">{c.code}</td>
                  <td>{c.discount_type === 'percentual' ? `${c.discount_value}%` : formatKz(c.discount_value)}{Number(c.min_order) > 0 && <span className="block text-xs text-ink-muted">mín. {formatKz(c.min_order)}</span>}</td>
                  <td className="tabular">{c.uses}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                  <td className="text-xs text-ink-muted">{c.expires_at ? formatDate(c.expires_at) : '—'}</td>
                  <td><Badge tone={c.is_active ? 'green' : 'neutral'}>{c.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
                </tr>
              ))}
            </TBody>
          </Table>
          {!coupons?.length && <EmptyState compact title="Sem cupões" />}
        </Card>
        <Card>
          <CardHeader title="Banners da página inicial" />
          <CardBody className="space-y-3">
            {(banners ?? []).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-md border border-line p-3 text-sm">
                <div><p className="font-medium">{b.title}</p><p className="text-xs text-ink-muted">{b.subtitle}</p></div>
                <Badge tone={b.is_active ? 'green' : 'neutral'}>{b.is_active ? 'Activo' : 'Inactivo'}</Badge>
              </div>
            ))}
            {!banners?.length && <EmptyState compact title="Sem banners" description="O poster da marca é usado por defeito." />}
          </CardBody>
        </Card>
      </div>
    </>
  )
}

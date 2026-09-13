import { createClient } from '@/lib/supabase/server'
import { PageHeader, Card, Stars, Badge, EmptyState } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { REVIEW_STATUS } from '@/lib/labels'
import { ReviewActions } from './actions'

export const dynamic = 'force-dynamic'

export default async function ReviewsAdminPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient()
  let q = supabase.from('reviews').select('*, products(name,slug)').order('created_at', { ascending: false }).limit(100)
  if (searchParams.estado) q = q.eq('status', searchParams.estado as never)
  else q = q.order('status')
  const { data: reviews } = await q
  const tabs = [['', 'Todas'], ['pendente', 'Pendentes'], ['aprovada', 'Aprovadas'], ['rejeitada', 'Rejeitadas'], ['oculta', 'Ocultas']]
  return (
    <>
      <PageHeader title="Avaliações" description="Moderação de reviews dos clientes." />
      <div className="mb-4 flex gap-2 text-sm">
        {tabs.map(([v, l]) => <a key={v} href={v ? `/admin/avaliacoes?estado=${v}` : '/admin/avaliacoes'} className={`rounded-md px-3 py-1.5 font-medium ${ (searchParams.estado ?? '') === v ? 'bg-brand-600 text-white' : 'border border-line bg-white hover:bg-surface'}`}>{l}</a>)}
      </div>
      {!reviews?.length ? <EmptyState title="Sem avaliações" className="rounded-lg border border-dashed border-line bg-white" /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><Stars value={r.rating} size="md" /><span className="text-xs font-medium text-ink-muted">{REVIEW_STATUS[r.status].label}</span></div>
                  <p className="mt-1.5 text-sm font-medium">{r.products?.name}</p>
                  {r.title && <p className="mt-0.5 text-sm font-medium">{r.title}</p>}
                  <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
                  <p className="mt-1.5 text-xs text-ink-muted">{r.author_name} · {formatDate(r.created_at)}{r.is_verified && ' · compra verificada'}</p>
                  {r.admin_response && <p className="mt-2 rounded-md bg-surface p-2.5 text-xs"><strong>Resposta:</strong> {r.admin_response}</p>}
                </div>
              </div>
              <ReviewActions review={r} />
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

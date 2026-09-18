import type { Metadata } from 'next'
import Link from '@/components/ui/navigation-link'
import { notFound } from 'next/navigation'
import { ShieldCheck, BadgeCheck } from 'lucide-react'
import { getProductBySlug }  from '@/lib/store/queries'
import { ProductGrid, ProductImage } from '@/components/store/product-card'
import { Stars, Badge } from '@/components/ui'
import { priceOf } from '@/lib/store/price'
import { formatKz } from '@/lib/utils'
import { CONDITION } from '@/lib/labels'
import { ProductBuyBox } from './buy-box'
import { ProductGallery } from './gallery'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await getProductBySlug(params.slug)
  return res ? { title: res.product.name ?? 'Produto', description: res.product.description?.slice(0, 160) } : {}
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const res = await getProductBySlug(params.slug)
  if (!res) notFound()
  const { product: p, images, reviews, related } = res
  const price = priceOf(p)
  const specs = (p.specs ?? {}) as Record<string, string>
  const dd = (p.device_details ?? {}) as Record<string, unknown>

  return (
    <div className="shell py-8">
      <nav className="text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink">Início</Link> / <Link href="/loja" className="hover:text-ink">Loja</Link>
        {p.category_slug && <> / <Link href={`/categoria/${p.category_slug}`} className="hover:text-ink">{p.category_name}</Link></>}
        {' '}/ <span className="text-ink">{p.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <ProductGallery images={images} fallback={p.image_url} name={p.name ?? ''} />
        <div>
          <div className="flex items-center gap-2">
            {p.brand_name && <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{p.brand_name}</span>}
            {p.condition && <Badge tone={CONDITION[p.condition]?.tone ?? 'neutral'}>{CONDITION[p.condition]?.label ?? p.condition}</Badge>}
            {price.active && <Badge tone="red">-{price.discount}%</Badge>}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{p.name}</h1>
          {(p.rating_count ?? 0) > 0 && (
            <a href="#avaliacoes" className="mt-2 inline-flex items-center gap-2">
              <Stars value={Number(p.rating_avg)} size="md" />
              <span className="text-sm text-ink-muted">{Number(p.rating_avg).toFixed(1)} · {p.rating_count} avaliações</span>
            </a>
          )}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular">{formatKz(price.final)}</span>
            {price.active && <span className="text-lg text-ink-muted line-through tabular">{formatKz(price.price)}</span>}
          </div>
          <ProductBuyBox p={p} />

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {[
              ['Condição', p.condition ? CONDITION[p.condition]?.label : null],
              ['Armazenamento', p.storage], ['RAM', p.ram], ['Cor', p.color],
              ['Saúde da bateria', p.battery_health != null ? `${p.battery_health}%` : null],
              ['Garantia', p.warranty_months ? `${p.warranty_months} meses` : null],
              ['Modelo', p.model], ['Referência', p.sku],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string} className="rounded-md border border-line px-3 py-2">
                <p className="text-xs text-ink-muted">{k}</p><p className="mt-0.5 font-medium">{v as string}</p>
              </div>
            ))}
          </div>

          {p.warranty_months ? (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              <ShieldCheck className="h-4 w-4" /> Garantia de {p.warranty_months} meses incluída.
            </div>
          ) : null}
        </div>
      </div>

      {(p.description || Object.keys(specs).length > 0) && (
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {p.description && (
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold">Descrição</h2>
              <div className="prose-sm mt-3 whitespace-pre-line text-ink-soft leading-relaxed">{p.description}</div>
            </div>
          )}
          {Object.keys(specs).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold">Especificações</h2>
              <dl className="mt-3 divide-y divide-line rounded-lg border border-line text-sm">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-4 py-2.5"><dt className="text-ink-muted">{k}</dt><dd className="font-medium text-right">{String(v)}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

      <section id="avaliacoes" className="mt-12">
        <h2 className="text-lg font-semibold">Avaliações ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-line p-8 text-center text-sm text-ink-muted">Ainda não há avaliações. Sê o primeiro a avaliar este produto depois da compra.</div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} size="md" />
                  {r.is_verified && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" /> Compra verificada</span>}
                </div>
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
                <p className="mt-2 text-xs text-ink-muted">{r.author_name}</p>
                {r.admin_response && <div className="mt-3 rounded-md bg-surface p-3 text-sm"><p className="text-xs font-semibold text-ink-muted">Resposta da loja</p><p className="mt-0.5">{r.admin_response}</p></div>}
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-lg font-semibold">Também podes gostar</h2>
          <ProductGrid products={related} compact />
        </section>
      )}
    </div>
  )
}

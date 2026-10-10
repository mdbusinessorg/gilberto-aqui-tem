import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldCheck, BadgeCheck, Palette, BatteryFull, HardDrive, Package, Eye, Heart } from 'lucide-react'
import { getProductBySlug } from '@/lib/store/queries'
import { ProductGrid } from '@/components/store/product-card'
import { Stars } from '@/components/ui'
import { Reveal } from '@/components/store/reveal'
import { priceOf } from '@/lib/store/price'
import { CONDITION } from '@/lib/labels'
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp'
import { ProductBuyBox } from './buy-box'
import { ProductGallery } from './gallery'
import { Faq } from './faq'
import { ViewPing } from '@/components/store/view-ping'
import { getMetrics, getStoreReviews } from '@/lib/metrics'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await getProductBySlug(params.slug)
  return res ? { title: res.product.name ?? 'Produto', description: res.product.description?.slice(0, 160) } : {}
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const res = await getProductBySlug(params.slug)
  if (!res) notFound()
  const { product: p, images, reviews, related } = res
  const viewsMap = await getMetrics()
  const pm = viewsMap[p.id!] ?? { views: 0, favs: 0 }
  const extraReviews = (await getStoreReviews())
    .filter(r => r.product_id === p.id && (r.status === 'aprovada'))
    .map(r => ({ id: r.id, author_name: r.author_name, rating: r.rating, title: null, body: r.comment, image_url: r.photo ?? null, is_verified: true, is_featured: false, admin_response: null, created_at: r.created_at })) as typeof reviews
  const allReviews = [...reviews, ...extraReviews]
  const price = priceOf(p)
  const specs = (p.specs ?? {}) as Record<string, string>
  const out = (p.stock_total ?? 0) <= 0

  const features: [string, string][] = ([
    [p.storage, 'Armazenamento'], [p.ram, 'Memória RAM'], [p.color, 'Cor'],
    [p.battery_health != null ? `Bateria ${p.battery_health}%` : null, 'Saúde da bateria'],
    [p.warranty_months ? `${p.warranty_months} meses` : null, 'Garantia incluída'],
    [p.condition ? CONDITION[p.condition]?.label : null, 'Condição do aparelho'],
    [p.model, 'Modelo'],
  ] as [string | null | undefined, string][]).filter((f): f is [string, string] => !!f[0]).slice(0, 6)
  const tag = price.active ? `-${price.discount}%` : p.condition ? CONDITION[p.condition]?.label ?? null : null

  const benefits: { icon: React.ReactNode; title: string; sub: string }[] = [
    p.warranty_months ? { icon: <ShieldCheck className="h-5 w-5" />, title: 'Garantia incluída', sub: `${p.warranty_months} meses de garantia da loja` } : null,
    p.condition ? { icon: <BadgeCheck className="h-5 w-5" />, title: 'Estado verificado', sub: `Condição: ${CONDITION[p.condition]?.label ?? p.condition}` } : null,
    p.storage || p.ram ? { icon: <HardDrive className="h-5 w-5" />, title: 'Desempenho', sub: [p.storage, p.ram].filter(Boolean).join(' · ') } : null,
    p.battery_health != null ? { icon: <BatteryFull className="h-5 w-5" />, title: 'Bateria saudável', sub: `Saúde da bateria: ${p.battery_health}%` } : null,
    p.color ? { icon: <Palette className="h-5 w-5" />, title: 'Cor', sub: p.color } : null,
  ].filter((b): b is NonNullable<typeof b> => !!b).slice(0, 4)
  if (benefits.length === 0) benefits.push({ icon: <Package className="h-5 w-5" />, title: 'Produto original', sub: 'Verificado pela equipa Gilberto Aqui Tem' })

  const specRows: [string, string][] = ([
    ['Marca', p.brand_name], ['Modelo', p.model], ['Armazenamento', p.storage], ['Memória RAM', p.ram],
    ['Cor', p.color], ['Condição', p.condition ? CONDITION[p.condition]?.label : null],
    ['Garantia', p.warranty_months ? `${p.warranty_months} meses` : null],
    ['Referência', p.sku],
    ...Object.entries(specs) as [string, string][],
  ] as [string, string | null | undefined][]).filter((r): r is [string, string] => !!r[1])

  const faqItems = [
    { q: 'Qual é o estado deste produto?', a: p.condition ? `Este produto está em condição: ${CONDITION[p.condition]?.label ?? p.condition}. Todas as unidades são verificadas pela nossa equipa antes de serem publicadas.` : 'Todos os produtos são verificados pela nossa equipa antes de serem publicados na loja.' },
    { q: 'O produto está disponível?', a: out ? 'Este produto está esgotado de momento. Fala connosco no WhatsApp para reservar ou ser avisado quando voltar.' : `Sim — temos ${p.stock_total} ${p.stock_total === 1 ? 'unidade disponível' : 'unidades disponíveis'} para compra imediata.` },
    { q: 'Como funciona a entrega?', a: 'Podes levantar na nossa loja em Luanda ou escolher entrega ao domicílio no checkout. Se preferires, combina a entrega directamente connosco no WhatsApp.' },
    { q: 'Quais são as formas de pagamento?', a: 'Aceitamos transferência bancária, Multicaixa Express e dinheiro na entrega. O pagamento é combinado e confirmado na finalização do pedido.' },
    { q: 'O produto tem garantia?', a: p.warranty_months ? `Sim — este produto inclui ${p.warranty_months} meses de garantia da loja.` : 'Fala connosco no WhatsApp para conhecer as condições de garantia deste produto.' },
    { q: 'Como posso contactar a loja?', a: `Podes falar connosco a qualquer momento pelo WhatsApp: ${WHATSAPP_DISPLAY}. Respondemos rápido durante o horário comercial.` },
  ]

  const shortDesc = p.description ? p.description.split('\n')[0].slice(0, 160) : null

  return (
    <div className="shell pd-page">
      <div className="pd-hero-card">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <ViewPing id={p.id!} />
          <ProductGallery images={images} fallback={p.image_url} name={p.name ?? ''} brand={p.brand_name ?? null} tag={tag} productId={p.id!} slug={p.slug!} />
          <div className="pd-body">
            <h1 className="pd-name">{p.name}</h1>
            <div className="pd-meta">
              {(p.rating_count ?? 0) > 0 ? (
                <a href="#avaliacoes" className="pd-rating">
                  <Stars value={Number(p.rating_avg)} size="md" />
                  <span>{Number(p.rating_avg).toFixed(1)} · {p.rating_count} avaliações</span>
                </a>
              ) : <span className="pd-rating"><Stars value={0} size="md" /><span>Sem avaliações ainda</span></span>}
              {(pm.views > 0 || pm.favs > 0) && (
                <span className="mt-1 flex items-center gap-3 text-xs text-ink-muted">
                  {pm.views > 0 && <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {pm.views} já viram</span>}
                  {pm.favs > 0 && <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {pm.favs} favoritos</span>}
                </span>
              )}
            </div>
            {shortDesc && <p className="pd-lead">{shortDesc}</p>}
            <ProductBuyBox p={p} features={features} />
          </div>
        </div>
      </div>

      <Reveal>
        <section className="pd-sec">
          <h2 className="pd-sec-t">Porquê este produto?</h2>
          <div className="pd-bens">
            {benefits.map((b, i) => (
              <div key={i} className="pd-ben">
                <div className="pd-ben-ic">{b.icon}</div>
                <div><p className="pd-ben-t">{b.title}</p><p className="pd-ben-s">{b.sub}</p></div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {(p.description || specRows.length > 0) && (
        <Reveal>
          <section className="pd-sec grid gap-8 lg:grid-cols-5">
            {p.description && (
              <div className="lg:col-span-3">
                <h2 className="pd-sec-t">Descrição</h2>
                <div className="prose-sm mt-4 whitespace-pre-line text-ink-soft leading-relaxed">{p.description}</div>
              </div>
            )}
            {specRows.length > 0 && (
              <div className="lg:col-span-2">
                <h2 className="pd-sec-t">Especificações</h2>
                <dl className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white text-sm">
                  {specRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 px-4 py-3"><dt className="text-ink-muted">{k}</dt><dd className="font-medium text-right">{v}</dd></div>
                  ))}
                </dl>
              </div>
            )}
          </section>
        </Reveal>
      )}

      <Reveal>
        <section id="avaliacoes" className="pd-sec">
          <h2 className="pd-sec-t">Avaliações dos clientes <span className="text-ink-muted font-normal text-sm">({allReviews.length})</span></h2>
          {allReviews.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">Este produto ainda não tem avaliações — sê o primeiro depois da compra.</div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allReviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Stars value={r.rating} size="md" />
                    {r.is_verified && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" /> Verificada</span>}
                  </div>
                  {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                  <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
                  {r.image_url && <img src={r.image_url} alt="Foto do cliente" className="mt-2 h-20 w-20 rounded-xl border border-line object-cover" />}
                  <p className="mt-2 text-xs text-ink-muted">{r.author_name}</p>
                  {r.admin_response && <div className="mt-3 rounded-lg bg-surface p-3 text-sm"><p className="text-xs font-semibold text-ink-muted">Resposta da loja</p><p className="mt-0.5">{r.admin_response}</p></div>}
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <Reveal>
        <section className="pd-sec">
          <h2 className="pd-sec-t">Perguntas frequentes</h2>
          <div className="mt-4"><Faq items={faqItems} /></div>
        </section>
      </Reveal>

      {related.length > 0 && (
        <Reveal>
          <section className="pd-sec">
            <h2 className="pd-sec-t">Produtos relacionados</h2>
            <div className="mt-5"><ProductGrid products={related} compact stats={viewsMap} /></div>
          </section>
        </Reveal>
      )}
    </div>
  )
}

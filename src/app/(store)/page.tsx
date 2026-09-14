import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MessageCircle, RefreshCw, ShieldCheck, Truck, BadgeCheck, Smartphone, Laptop, Gamepad2, Headphones, Watch, Cable, Flame } from 'lucide-react'
import { ButtonLink, EmptyState } from '@/components/ui'
import { ProductGrid } from '@/components/store/product-card'
import { getProducts, getCategories, getBrands, getBanners, getPublicSettings, type StorefrontProduct } from '@/lib/store/queries'
import { priceOf } from '@/lib/store/price'
import { formatKz } from '@/lib/utils'
import { waLink, supportMessage } from '@/lib/whatsapp'

export const revalidate = 60

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  iphone: Smartphone, samsung: Smartphone, android: Smartphone, laptops: Laptop, macbook: Laptop, playstation: Gamepad2, airpods: Headphones, 'apple-watch': Watch, acessorios: Cable,
}

export default async function HomePage() {
  const [featured, recent, promos, bestSellers, categories, brands, banners] = await Promise.all([
    getProducts({ featured: true, inStock: true, perPage: 8 }),
    getProducts({ sort: 'recent', inStock: true, perPage: 8 }),
    getProducts({ promo: true, inStock: true, perPage: 5 }),
    getProducts({ sort: 'popular', inStock: true, perPage: 3 }),
    getCategories(),
    getBrands(),
    getBanners(),
    getPublicSettings(),
  ])
  const topCats = categories.filter((c) => !c.parent_id)
  const banner = banners[0]
  const deal = promos.products[0]

  return (
    <>
      <section className="shell mt-6 grid gap-6 lg:grid-cols-[230px_1fr]">
        {/* Sidebar de categorias */}
        <aside className="hidden lg:block">
          <nav className="overflow-hidden rounded-md border border-line">
            <p className="bg-brand-600 px-4 py-3 text-[13px] font-semibold uppercase tracking-wide text-white">Comprar por categoria</p>
            <ul className="divide-y divide-line">
              {topCats.map((c) => {
                const Icon = CATEGORY_ICONS[c.slug] ?? Smartphone
                return (
                  <li key={c.id}>
                    <Link href={`/categoria/${c.slug}`} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink-soft hover:bg-surface hover:text-brand-700">
                      <Icon className="h-4 w-4 text-ink-muted" /> {c.name}
                    </Link>
                  </li>
                )
              })}
              <li><Link href="/trocas" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink-soft hover:bg-surface hover:text-brand-700"><RefreshCw className="h-4 w-4 text-ink-muted" /> Trocas</Link></li>
            </ul>
          </nav>

          {/* Hot deal */}
          {deal && (
            <div className="mt-6 rounded-md border border-line">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-ink"><Flame className="h-4 w-4 text-amber-500" /> Hot deal</p>
                <Link href="/loja?promo=1" className="text-xs text-brand-700 hover:underline">Ver mais</Link>
              </div>
              <Link href={`/produto/${deal.slug}`} className="block p-4">
                <div className="relative aspect-square overflow-hidden">
                  {deal.image_url
                    ? <Image src={deal.image_url} alt={deal.name ?? ''} fill sizes="230px" className="object-contain" />
                    : <div className="flex h-full items-center justify-center bg-surface text-ink-muted/40"><Smartphone className="h-10 w-10" /></div>}
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-ink">{deal.name}</p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[15px] font-semibold text-brand-700 tabular">{formatKz(priceOf(deal).final)}</span>
                  {priceOf(deal).active && <span className="text-xs text-ink-muted line-through tabular">{formatKz(priceOf(deal).price)}</span>}
                </div>
              </Link>
            </div>
          )}

          {/* Mais vendidos */}
          <div className="mt-6 rounded-md border border-line">
            <p className="border-b border-line px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-ink">Mais vendidos</p>
            <ul className="divide-y divide-line">
              {bestSellers.products.map((p) => (
                <li key={p.id}>
                  <Link href={`/produto/${p.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-line bg-white">
                      {p.image_url ? <Image src={p.image_url} alt="" fill sizes="48px" className="object-contain" /> : <Smartphone className="m-2.5 h-7 w-7 text-ink-muted/40" />}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 text-[13px] text-ink">{p.name}</span>
                      <span className="text-[13px] font-semibold text-brand-700 tabular">{formatKz(priceOf(p).final)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          {/* Hero estilo banner claro */}
          <div className="relative overflow-hidden rounded-md bg-gradient-to-r from-sky-100 via-cyan-50 to-teal-50">
            <div className="grid items-center gap-4 px-8 py-10 sm:grid-cols-2 sm:py-14">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Gilberto Aqui Tem · Angola</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{banner?.title || 'Tecnologia que combina contigo.'}</h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{banner?.subtitle || 'Telemóveis, laptops, PlayStation e acessórios. Compramos, vendemos e trocamos.'}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href="/loja">Ver produtos <ArrowRight className="h-4 w-4" /></ButtonLink>
                  <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-surface"><MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp</a>
                </div>
              </div>
              <div className="relative hidden aspect-[4/3] sm:block">
                <Image src={banner?.image_url || '/brand/poster.jpg'} alt={banner?.title || 'Produtos em destaque'} fill priority sizes="(max-width:1024px) 50vw, 40vw" className="object-contain drop-shadow-xl" />
              </div>
            </div>
          </div>

          {/* Destaques / tabs */}
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-6 border-b border-line">
              <h2 className="border-b-2 border-brand-600 pb-2 text-sm font-semibold uppercase tracking-wide text-ink">Novidades</h2>
              <Link href="/loja?destaque=1" className="pb-2 text-sm text-ink-muted hover:text-ink">Em destaque</Link>
              <Link href="/loja?promo=1" className="pb-2 text-sm text-ink-muted hover:text-ink">Promoções</Link>
            </div>
            {recent.products.length > 0 ? <ProductGrid products={recent.products} /> : <EmptyState compact title="O catálogo está a ser preparado. Volta em breve." className="rounded-lg border border-dashed border-line" />}
          </section>
        </div>
      </section>

      {/* Promo banner intermédio */}
      <section className="shell mt-12 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-md border border-line bg-surface p-6">
          <div><p className="text-sm font-semibold text-ink">Troca o teu telemóvel antigo</p><p className="mt-1 text-xs text-ink-muted">Recebe avaliação e paga só a diferença</p><Link href="/trocas" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">PEDIR AVALIAÇÃO <ArrowRight className="h-3 w-3" /></Link></div>
          <RefreshCw className="h-10 w-10 text-brand-200" />
        </div>
        <div className="flex items-center justify-between rounded-md border border-line bg-surface p-6">
          <div><p className="text-sm font-semibold text-ink">Acompanhar o teu pedido</p><p className="mt-1 text-xs text-ink-muted">Número de pedido + telemóvel</p><Link href="/pedido" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">VER PEDIDO <ArrowRight className="h-3 w-3" /></Link></div>
          <Truck className="h-10 w-10 text-brand-200" />
        </div>
      </section>

      <Section title="Em destaque" href="/loja?destaque=1" products={featured.products} emptyText="Ainda não há produtos em destaque." />
      {promos.products.length > 0 && <Section title="Promoções" href="/loja?promo=1" products={promos.products.slice(0, 4)} />}

      {/* Trocas */}
      <section className="shell mt-16">
        <div className="grid overflow-hidden rounded-md border border-line bg-white lg:grid-cols-2">
          <div className="p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Programa de trocas</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Troca o teu telemóvel antigo por um novo.</h2>
            <p className="mt-3 text-sm text-ink-muted">Envia os dados do teu aparelho, recebe uma proposta de avaliação e paga apenas a diferença. Também compramos dispositivos usados em bom estado.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
              <li className="flex gap-2"><ShieldCheck className="h-4 w-4 mt-0.5 text-brand-600" /> Avaliação transparente com inspecção técnica</li>
              <li className="flex gap-2"><RefreshCw className="h-4 w-4 mt-0.5 text-brand-600" /> Proposta enviada por WhatsApp em poucas horas</li>
              <li className="flex gap-2"><Truck className="h-4 w-4 mt-0.5 text-brand-600" /> Entrega do novo aparelho na loja ou em casa</li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/trocas">Pedir avaliação</ButtonLink>
              <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium text-ink hover:bg-surface"><MessageCircle className="h-4 w-4 text-[#25D366]" /> Perguntar no WhatsApp</a>
            </div>
          </div>
          <div className="relative min-h-[240px] bg-brand-900">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-xs rounded-md border border-white/15 bg-white/10 p-5 text-white">
                <p className="text-xs text-brand-200">Exemplo de cálculo</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-brand-100">Novo aparelho</span><span className="font-medium">Preço de loja</span></div>
                  <div className="flex justify-between"><span className="text-brand-100">− Valor do teu aparelho</span><span className="font-medium">Avaliação</span></div>
                  <div className="mt-2 flex justify-between border-t border-white/15 pt-2"><span>Pagas só</span><span className="font-semibold">A diferença</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marcas */}
      <section className="shell mt-16">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-6">
          {brands.slice(0, 6).map((b) => (
            <Link key={b.id} href={`/loja?marca=${b.slug}`} className="flex h-16 items-center justify-center bg-white px-4 text-sm font-semibold uppercase tracking-wide text-ink-muted transition-colors hover:text-brand-700">{b.name}</Link>
          ))}
        </div>
      </section>

      {/* Confiança */}
      <section className="shell mt-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: 'Garantia real', d: 'Cada aparelho sai com garantia definida na ficha do produto.' },
            { icon: BadgeCheck, t: 'Aparelhos verificados', d: 'Usados passam por inspecção técnica com estado de bateria declarado.' },
            { icon: MessageCircle, t: 'Atendimento directo', d: 'Fala connosco no WhatsApp antes, durante e depois da compra.' },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3 rounded-md border border-line p-5">
              <f.icon className="h-5 w-5 shrink-0 text-brand-600" />
              <div><h3 className="text-sm font-semibold text-ink">{f.t}</h3><p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{f.d}</p></div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function Section({ title, href, products, emptyText }: { title: string; href: string; products: StorefrontProduct[]; emptyText?: string }) {
  return (
    <section className="shell mt-14">
      <div className="mb-4 flex items-end justify-between border-b border-line pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800">Ver tudo <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
      {products.length > 0 ? <ProductGrid products={products} /> : <EmptyState compact title={emptyText ?? 'Sem produtos'} className="rounded-lg border border-dashed border-line" />}
    </section>
  )
}

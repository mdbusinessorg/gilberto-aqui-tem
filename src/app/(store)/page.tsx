import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MessageCircle, RefreshCw, ShieldCheck, Truck, BadgeCheck, Smartphone, Laptop, Gamepad2, Headphones, Watch, Cable } from 'lucide-react'
import { ButtonLink, EmptyState } from '@/components/ui'
import { ProductGrid } from '@/components/store/product-card'
import { getProducts, getCategories, getBanners, getPublicSettings } from '@/lib/store/queries'
import { waLink, supportMessage } from '@/lib/whatsapp'

export const revalidate = 60

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  iphone: Smartphone, samsung: Smartphone, android: Smartphone, laptops: Laptop, macbook: Laptop, playstation: Gamepad2, airpods: Headphones, 'apple-watch': Watch, acessorios: Cable,
}

export default async function HomePage() {
  const [featured, recent, promos, categories, banners, settings] = await Promise.all([
    getProducts({ featured: true, inStock: true, perPage: 8 }),
    getProducts({ sort: 'recent', inStock: true, perPage: 8 }),
    getProducts({ promo: true, inStock: true, perPage: 4 }),
    getCategories(),
    getBanners(),
    getPublicSettings(),
  ])
  const topCats = categories.filter((c) => !c.parent_id)
  const banner = banners[0]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #4A7EF5 0, transparent 40%), radial-gradient(circle at 80% 80%, #1F5AE0 0, transparent 45%)' }} />
        <div className="shell relative grid items-center gap-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-100">
              <BadgeCheck className="h-3.5 w-3.5" /> Compramos · Vendemos · Trocamos
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">Tecnologia que combina contigo.</h1>
            <p className="mt-5 max-w-xl text-lg text-brand-100/90">Telemóveis, laptops, PlayStation e acessórios. Compramos, vendemos e trocamos.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/loja" size="lg" className="bg-white text-brand-800 hover:bg-brand-50">Ver produtos <ArrowRight className="h-4 w-4" /></ButtonLink>
              <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-md bg-[#25D366] px-6 text-[15px] font-medium text-white hover:bg-[#1fb857]"><MessageCircle className="h-4 w-4" /> Falar no WhatsApp</a>
              <ButtonLink href="/trocas" size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10"><RefreshCw className="h-4 w-4" /> Trocar dispositivo</ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
              <div><dt className="text-brand-200">Garantia</dt><dd className="mt-0.5 font-medium">Em todos os aparelhos</dd></div>
              <div><dt className="text-brand-200">Entrega</dt><dd className="mt-0.5 font-medium">Luanda e províncias</dd></div>
              <div><dt className="text-brand-200">Pagamento</dt><dd className="mt-0.5 font-medium">{settings.checkout.payment_methods[0] ?? 'Flexível'}</dd></div>
            </dl>
          </div>
          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-pop">
              <Image src={banner?.image_url || '/brand/poster.jpg'} alt={banner?.title || 'Gilberto Aqui Tem'} fill priority sizes="(max-width: 1024px) 90vw, 40vw" className="object-cover" />
              {banner?.title && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/90 to-transparent p-5">
                  <p className="text-lg font-semibold">{banner.title}</p>
                  {banner.subtitle && <p className="text-sm text-brand-100">{banner.subtitle}</p>}
                  {banner.link_url && <Link href={banner.link_url} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white underline-offset-2 hover:underline">{banner.cta_label || 'Ver mais'} <ArrowRight className="h-3.5 w-3.5" /></Link>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      {topCats.length > 0 && (
        <section className="shell -mt-8 relative z-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {topCats.slice(0, 6).map((c) => {
              const Icon = CATEGORY_ICONS[c.slug] ?? Smartphone
              return (
                <Link key={c.id} href={`/categoria/${c.slug}`} className="flex items-center gap-3 rounded-lg border border-line bg-white p-4 shadow-card transition-colors hover:border-brand-300">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
                  <span className="text-sm font-medium text-ink">{c.name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Destaques */}
      <Section title="Em destaque" href="/loja?destaque=1" products={featured.products} emptyText="Ainda não há produtos em destaque. Explora a loja." />

      {/* Trocas */}
      <section className="shell mt-20">
        <div className="grid overflow-hidden rounded-xl border border-line bg-surface lg:grid-cols-2">
          <div className="p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Programa de trocas</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Troca o teu telemóvel antigo por um novo.</h2>
            <p className="mt-3 text-ink-muted">Envia os dados do teu aparelho, recebe uma proposta de avaliação e paga apenas a diferença. Também compramos dispositivos usados em bom estado.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
              <li className="flex gap-2"><ShieldCheck className="h-4 w-4 mt-0.5 text-brand-600" /> Avaliação transparente com inspecção técnica</li>
              <li className="flex gap-2"><RefreshCw className="h-4 w-4 mt-0.5 text-brand-600" /> Proposta enviada por WhatsApp em poucas horas</li>
              <li className="flex gap-2"><Truck className="h-4 w-4 mt-0.5 text-brand-600" /> Entrega do novo aparelho na loja ou em casa</li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/trocas">Pedir avaliação</ButtonLink>
              <a href={waLink(supportMessage())} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-surface"><MessageCircle className="h-4 w-4" /> Perguntar no WhatsApp</a>
            </div>
          </div>
          <div className="relative min-h-[260px] bg-brand-900">
            <div className="absolute inset-0 grid grid-cols-3 gap-px opacity-[0.07]">{Array.from({ length: 24 }).map((_, i) => <div key={i} className="bg-white" />)}</div>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-xs rounded-lg border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
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

      {promos.products.length > 0 && <Section title="Promoções" href="/loja?promo=1" products={promos.products} />}
      <Section title="Novidades" href="/loja?ordem=recent" products={recent.products} emptyText="O catálogo está a ser preparado. Volta em breve." />

      {/* Confiança */}
      <section className="shell mt-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: 'Garantia real', d: 'Cada aparelho sai com garantia definida na ficha do produto — sem letras pequenas.' },
            { icon: BadgeCheck, t: 'Aparelhos verificados', d: 'Usados e recondicionados passam por inspecção técnica com estado de bateria declarado.' },
            { icon: MessageCircle, t: 'Atendimento directo', d: 'Fala connosco no WhatsApp antes, durante e depois da compra.' },
          ].map((f) => (
            <div key={f.t} className="rounded-lg border border-line p-6">
              <f.icon className="h-5 w-5 text-brand-600" />
              <h3 className="mt-3 font-semibold text-ink">{f.t}</h3>
              <p className="mt-1 text-sm text-ink-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function Section({ title, href, products, emptyText }: { title: string; href: string; products: Awaited<ReturnType<typeof getProducts>>['products']; emptyText?: string }) {
  return (
    <section className="shell mt-16">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">Ver tudo <ArrowRight className="h-4 w-4" /></Link>
      </div>
      {products.length > 0 ? <ProductGrid products={products} /> : <EmptyState compact title={emptyText ?? 'Sem produtos'} className="rounded-lg border border-dashed border-line" />}
    </section>
  )
}

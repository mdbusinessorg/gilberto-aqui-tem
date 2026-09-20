import Link from '@/components/ui/navigation-link'
import Image from 'next/image'
import { ChevronRight, ChevronLeft, ArrowRight, Search, Sparkles, TrendingUp, Percent, Smartphone, Laptop, Gamepad2, Headphones, Watch, Cable, Grid2X2, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { ProductCard, ProductImage } from '@/components/store/product-card'
import { Stars } from '@/components/ui'
import { getProducts, getCategories, getBrands, getBanners } from '@/lib/store/queries'
import { priceOf } from '@/lib/store/price'
import { formatKz } from '@/lib/utils'
import { waLink, supportMessage } from '@/lib/whatsapp'

export const revalidate = 60

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  iphone: Smartphone, samsung: Smartphone, android: Smartphone, laptops: Laptop, macbook: Laptop,
  playstation: Gamepad2, airpods: Headphones, 'apple-watch': Watch, acessorios: Cable, audio: Headphones,
}

export default async function HomePage() {
  const [all, recent, featured, promos, popular, phones, audio, categories, brands, banners] = await Promise.all([
    getProducts({ inStock: true, perPage: 9 }),
    getProducts({ sort: 'recent', inStock: true, perPage: 8 }),
    getProducts({ featured: true, inStock: true, perPage: 8 }),
    getProducts({ promo: true, inStock: true, perPage: 4 }),
    getProducts({ sort: 'popular', inStock: true, perPage: 3 }),
    getProducts({ categories: ['iphone', 'samsung', 'android'], inStock: true, perPage: 4 }),
    getProducts({ category: 'audio', inStock: true, perPage: 4 }),
    getCategories(), getBrands(), getBanners(),
  ])
  const banner = banners[0]
  const heroImage = banner?.image_url || '/promotions/iphone-x-hero.webp'
  const deal = promos.products[0]
  const bestSellers = (popular.products.some(p => (p.sold_count ?? 0) > 0) ? popular.products : featured.products).slice(0, 3)
  const recommended = [...featured.products, ...recent.products].filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i).slice(0, 4)
  const topCategories = categories.filter(c => !c.parent_id).slice(0, 7)
  const sections = [
    { id: 'phones', title: 'Smartphones', href: '/loja?categoria=iphone', products: phones.products },
    { id: 'audio', title: 'Áudio', href: '/categoria/audio', products: audio.products },
  ].filter(s => s.products.length > 0)
  const promoA = phones.products[0]
  const promoB = audio.products[0]

  return (
    <div className="shop-home">
      <section className="shop-hero" aria-label="Destaque">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="shop-hero-image" />
        <h1>Loja</h1>
        <div className="shop-hero-bar">
          <strong>{banner?.title ?? 'Tudo o que precisas'}</strong>
          <form action="/loja" role="search">
            <Search className="h-4 w-4" />
            <input name="q" placeholder="Pesquisar na Gilberto Aqui Tem" aria-label="Pesquisar" />
            <button type="submit">Pesquisar</button>
          </form>
        </div>
      </section>

      <div className="shell shop-layout">
        <aside className="shop-side">
          <h2>Categorias</h2>
          <Link href="/loja" className="shop-side-all"><Grid2X2 className="h-4 w-4" /> Todos os produtos <span>{all.total}</span></Link>
          <ul>
            {topCategories.map(c => { const Icon = CATEGORY_ICONS[c.slug] ?? Grid2X2; return <li key={c.id}><Link href={`/categoria/${c.slug}`}><Icon className="h-3.5 w-3.5" /> {c.name}</Link></li> })}
          </ul>
          <nav className="shop-side-links">
            <Link href="/loja?ordem=recent"><Sparkles className="h-4 w-4" /> Novidades <ChevronRight className="h-3 w-3" /></Link>
            <Link href="/loja?ordem=popular"><TrendingUp className="h-4 w-4" /> Mais vendidos <ChevronRight className="h-3 w-3" /></Link>
            <Link href="/loja?promo=1"><Percent className="h-4 w-4" /> Em promoção <ChevronRight className="h-3 w-3" /></Link>
          </nav>

          {deal && (
            <div className="shop-deal">
              <h3>Hot Deal</h3>
              <Link href={`/produto/${deal.slug}`}>
                <div className="shop-deal-image"><ProductImage src={deal.image_url} alt={deal.name ?? ''} className="h-full w-full p-3" sizes="220px" /></div>
                <p>{deal.name}</p>
                <Stars value={Number(deal.rating_avg ?? 5)} />
                <div className="shop-deal-price"><strong>{formatKz(priceOf(deal).final)}</strong>{priceOf(deal).active && <s>{formatKz(priceOf(deal).price)}</s>}</div>
              </Link>
            </div>
          )}

          {bestSellers.length > 0 && (
            <div className="shop-best">
              <h3>Mais Vendidos</h3>
              {bestSellers.map(p => (
                <Link key={p.id} href={`/produto/${p.slug}`} className="shop-best-item">
                  <div className="shop-best-image"><ProductImage src={p.image_url} alt={p.name ?? ''} className="h-full w-full p-1.5" sizes="64px" /></div>
                  <div><Stars value={Number(p.rating_avg ?? 5)} /><p>{p.name}</p><strong>{formatKz(priceOf(p).final)}</strong></div>
                </Link>
              ))}
            </div>
          )}

          <div className="shop-services">
            {[
              { icon: MessageCircle, title: 'Atendimento directo', text: 'WhatsApp', href: waLink(supportMessage()) },
              { icon: RefreshCw, title: 'Compramos e trocamos', text: 'Avalia o teu aparelho', href: '/trocas' },
              { icon: ShieldCheck, title: 'Garantia', text: 'Estado na ficha', href: '/loja' },
            ].map(s => <Link key={s.title} href={s.href}><span><s.icon className="h-4 w-4" /></span><div><strong>{s.title}</strong><p>{s.text}</p></div></Link>)}
          </div>
        </aside>

        <main className="shop-main">
          <div className="shop-grid">{all.products.map(p => <ProductCard key={p.id} p={p} actions />)}</div>
          <nav className="shop-pager" aria-label="Paginação">
            <span><ChevronLeft className="h-3.5 w-3.5" /> Anterior</span>
            <div><b>1</b>{[2, 3].map(n => <Link key={n} href={`/loja?pagina=${n}`}>{n}</Link>)}</div>
            <Link href="/loja?pagina=2">Seguinte <ArrowRight className="h-3.5 w-3.5" /></Link>
          </nav>

          <div className="shop-promos">
            {promoA && <Link href={`/produto/${promoA.slug}`} className="shop-promo"><div><small>Smartphone</small><strong>{promoA.name}</strong><span>Ver produto</span></div><div className="shop-promo-image"><ProductImage src={promoA.image_url} alt="" className="h-full w-full p-3" sizes="200px" /></div></Link>}
            {promoB && <Link href={`/produto/${promoB.slug}`} className="shop-promo"><div><small>Áudio</small><strong>{promoB.name}</strong><span>Ver produto</span></div><div className="shop-promo-image"><ProductImage src={promoB.image_url} alt="" className="h-full w-full p-3" sizes="200px" /></div></Link>}
          </div>

          {sections.map(s => (
            <section key={s.id} className="shop-section" aria-labelledby={`${s.id}-t`}>
              <div className="shop-heading"><h2 id={`${s.id}-t`}>{s.title}</h2><Link href={s.href}>Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              <div className="shop-grid cols-4">{s.products.map(p => <ProductCard key={p.id} p={p} actions />)}</div>
            </section>
          ))}
        </main>
      </div>

      <div className="shell">
        <section className="shop-section" aria-labelledby="rec-t">
          <div className="shop-heading big"><h2 id="rec-t">Explora as nossas recomendações</h2><Link href="/loja?ordem=popular">Ver todas <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="shop-grid cols-4">{recommended.map(p => <ProductCard key={p.id} p={p} actions />)}</div>
        </section>

        <nav aria-label="Marcas" className="shop-brands">
          {brands.filter(b => ['apple', 'samsung', 'sony', 'dell', 'jbl', 'hp'].includes(b.slug)).map(b => <Link key={b.id} href={`/loja?marca=${b.slug}`}>{b.name}</Link>)}
        </nav>

        <section className="shop-cta">
          <div>
            <h2>Pronto para as<br />nossas novidades?</h2>
            <form action={waLink(supportMessage())} method="get" target="_blank">
              <input placeholder="O teu email" aria-label="Email" />
              <button type="submit">Enviar</button>
            </form>
          </div>
          <div className="shop-cta-text">
            <strong>Gilberto Aqui Tem — Telemóvel &amp; Acessórios</strong>
            <p>Ouvimos o que precisas, encontramos o aparelho certo e entregamos em Luanda com garantia e atendimento directo no WhatsApp.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

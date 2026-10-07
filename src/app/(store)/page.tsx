import Link from '@/components/ui/navigation-link'
import Image from 'next/image'
import { ChevronRight, ArrowRight, Menu, Truck, ShieldCheck, RefreshCw, Smartphone, Laptop, Gamepad2, Headphones, Watch, Cable, Grid2X2 } from 'lucide-react'
import { ProductCard, ProductImage } from '@/components/store/product-card'
import { Reveal } from '@/components/store/reveal'
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
  const [recent, featured, promos, misc, popular, phones, audio, allProducts, categories, brands, banners] = await Promise.all([
    getProducts({ sort: 'recent', inStock: true, perPage: 3 }),
    getProducts({ featured: true, inStock: true, perPage: 3 }),
    getProducts({ promo: true, inStock: true, perPage: 3 }),
    getProducts({ categories: ['acessorios', 'apple-watch', 'airpods', 'playstation', 'laptops', 'macbook'], inStock: true, perPage: 3 }),
    getProducts({ sort: 'popular', inStock: true, perPage: 3 }),
    getProducts({ categories: ['iphone', 'samsung', 'android'], inStock: true, perPage: 4 }),
    getProducts({ category: 'audio', inStock: true, perPage: 4 }),
    getProducts({ inStock: true, perPage: 96 }),
    getCategories(), getBrands(), getBanners(),
  ])
  const banner = banners[0]
  const heroImage = banner?.image_url || '/promotions/iphone-x-hero.webp'
  const heroPhone = phones.products.find(p => /iphone x/i.test(p.name ?? '')) ?? phones.products[0]
  const novidades = allProducts.products.length ? allProducts.products.slice(0, 8) : recent.products
  const destaques = allProducts.products.filter(p => p.is_featured)
  const promocoes = allProducts.products.filter(p => p.is_promo || (p.promo_price && p.promo_price < (p.price ?? 0))).slice(0, 8)
  const acessorios = allProducts.products.filter(p => ['acessorios', 'audio', 'outros', 'playstation'].includes(p.category_slug ?? '')).slice(0, 8)
  const smartList = phones.products.length ? phones.products : allProducts.products.filter(p => ['iphone', 'samsung', 'android'].includes(p.category_slug ?? '')).slice(0, 4)
  const deal = promos.products[0]
  const best = (popular.products.some(p => (p.sold_count ?? 0) > 0) ? popular.products : featured.products).slice(0, 3)
  const topCategories = categories.filter(c => !c.parent_id)
  const catImage = (slug: string) => allProducts.products.find(p => p.category_slug === slug)?.image_url ?? null
  const childrenOf = (id: string) => categories.filter(c => c.parent_id === id).map(c => c.name).slice(0, 3).join(', ')
  const promoA = audio.products[0]
  const promoB = misc.products[0]
  const promoC = audio.products[1]
  const promoD = misc.products[1]

  return (
    <div className="sm-home">
      <div className="shell sm-layout">
        <aside className="sm-side">
          <div className="sm-cats">
            <h2><Menu className="h-4 w-4" /> Categorias</h2>
            <ul>
              {topCategories.map(c => { const Icon = CATEGORY_ICONS[c.slug] ?? Grid2X2; return (
                <li key={c.id}><Link href={`/categoria/${c.slug}`}><Icon className="h-4 w-4" /><span><strong>{c.name}</strong><small>{childrenOf(c.id) || 'Ver produtos'}</small></span><ChevronRight className="h-3.5 w-3.5" /></Link></li>
              ) })}
              <li><Link href="/loja"><Grid2X2 className="h-4 w-4" /><span><strong>Todos os produtos</strong><small>Catálogo completo</small></span><ChevronRight className="h-3.5 w-3.5" /></Link></li>
            </ul>
          </div>

          {deal && (
            <div className="sm-box sm-deal">
              <h3>Hot Deal</h3>
              <Link href={`/produto/${deal.slug}`}>
                <div className="sm-deal-image"><ProductImage src={deal.image_url} alt={deal.name ?? ''} className="h-full w-full p-4" sizes="240px" /></div>
                <p>{deal.name}</p>
                <Stars value={Number(deal.rating_avg ?? 5)} />
                <div className="sm-price"><strong>{formatKz(priceOf(deal).final)}</strong>{priceOf(deal).active && <s>{formatKz(priceOf(deal).price)}</s>}</div>
              </Link>
            </div>
          )}

          {best.length > 0 && (
            <div className="sm-box">
              <h3>Mais Vendidos</h3>
              {best.map(p => (
                <Link key={p.id} href={`/produto/${p.slug}`} className="sm-best">
                  <div className="sm-best-image"><ProductImage src={p.image_url} alt={p.name ?? ''} className="h-full w-full p-1.5" sizes="64px" /></div>
                  <div><Stars value={Number(p.rating_avg ?? 5)} /><p>{p.name}</p><strong>{formatKz(priceOf(p).final)}</strong></div>
                </Link>
              ))}
            </div>
          )}

          <nav aria-label="Marcas" className="sm-brands sm-brands-side">
            {brands.filter(b => ['apple', 'samsung', 'sony', 'dell', 'jbl', 'hp'].includes(b.slug)).map(b => <Link key={b.id} href={`/loja?marca=${b.slug}`}>{b.name}</Link>)}
          </nav>

          <div className="sm-services">
            {[
              { icon: Truck, title: 'Entrega em Luanda', text: 'Combinada no WhatsApp', href: waLink(supportMessage()) },
              { icon: RefreshCw, title: 'Compramos e trocamos', text: 'Avalia o teu aparelho', href: '/trocas' },
              { icon: ShieldCheck, title: 'Garantia', text: 'Estado e garantia na ficha', href: '/loja' },
            ].map(s => <Link key={s.title} href={s.href}><span><s.icon className="h-4 w-4" /></span><div><strong>{s.title}</strong><p>{s.text}</p></div></Link>)}
          </div>
        </aside>

        <main className="sm-main">
          <nav className="sm-menu" aria-label="Menu principal">
            <Link href="/" className="active">Início</Link><Link href="/loja">Loja</Link><Link href="/loja?promo=1">Promoções</Link><Link href="/trocas">Trocas</Link><Link href="/contacto">Contacto</Link>
          </nav>

          <section className="sm-hero" aria-label="Destaque">
            <div className="sm-hero-copy">
              <p className="sm-hero-eyebrow">Gilberto Aqui Tem</p>
              <h1>{banner?.title ?? heroPhone?.name ?? 'Novidades'}</h1>
              <p className="sm-hero-sub">{banner?.subtitle ?? 'Os melhores preços de Luanda'}</p>
              <div><Link href={banner?.link_url ?? (heroPhone ? `/produto/${heroPhone.slug}` : '/loja')} className="sm-hero-cta">{banner?.cta_label ?? 'Comprar agora'}</Link></div>
            </div>
            <div className="sm-hero-media"><Image src={heroImage} alt="" fill priority sizes="(max-width: 767px) 60vw, 420px" /></div>
            {banner && heroPhone && <Link href={`/produto/${heroPhone.slug}`} className="sm-hero-alt">Ver {heroPhone.name} <ArrowRight className="h-3 w-3" /></Link>}
          </section>

          {topCategories.length > 0 && (
            <Reveal>
              <section className="sm-catstrip" aria-label="Comprar por categoria">
                <h2>Comprar por categoria</h2>
                <div className="sm-catstrip-grid">
                  {topCategories.map(c => {
                    const Icon = CATEGORY_ICONS[c.slug] ?? Grid2X2
                    const img = catImage(c.slug)
                    return (
                      <Link key={c.id} href={`/categoria/${c.slug}`} className="sm-cat">
                        <span className="sm-cat-img">
                          {img
                            ? <Image src={img} alt="" fill sizes="72px" />
                            : <Icon className="h-6 w-6" />}
                        </span>
                        <span>{c.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            </Reveal>
          )}

          {novidades.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Novidades</h2><Link href="/loja?ordem=recent">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{novidades.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          <Reveal>
          <div className="sm-banners">
            {promoA && <Link href={`/produto/${promoA.slug}`} className="sm-banner"><div><small>Áudio</small><strong>{promoA.name}</strong><span>Comprar</span></div><div className="sm-banner-image"><ProductImage src={promoA.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
            {promoB && <Link href={`/produto/${promoB.slug}`} className="sm-banner"><div><small>Diversos</small><strong>{promoB.name}</strong><span>Comprar</span></div><div className="sm-banner-image"><ProductImage src={promoB.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
          </div>
          </Reveal>

          {smartList.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Smartphones</h2><Link href="/loja?categoria=iphone">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid2">{smartList.map(p => <ProductCard key={p.id} p={p} horizontal compact />)}</div>
            </section></Reveal>
          )}

          {heroPhone && (
            <Reveal><Link href={`/produto/${heroPhone.slug}`} className="sm-wide">
              <span className="sm-wide-tag">A partir de<br /><strong>{formatKz(priceOf(heroPhone).final)}</strong></span>
              <div><h3>{heroPhone.name}</h3><p>Diz olá ao futuro.</p></div>
              <div className="sm-wide-image"><ProductImage src={heroPhone.image_url} alt="" className="h-full w-full" sizes="300px" /></div>
            </Link></Reveal>
          )}

          {destaques.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Destaques</h2><Link href="/loja">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{destaques.slice(0, 8).map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          {promocoes.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Em promoção</h2><Link href="/loja?promo=1">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{promocoes.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          {(acessorios.length > 0 || misc.products.length > 0 || audio.products.length > 0) && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Acessórios e diversos</h2><Link href="/loja?categoria=acessorios">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{(acessorios.length ? acessorios : (misc.products.length ? misc.products : audio.products)).slice(0, 8).map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          <div className="sm-banners">
            {promoC && <Link href={`/produto/${promoC.slug}`} className="sm-banner"><div><small>Som</small><strong>{promoC.name}</strong><span>A partir de {formatKz(priceOf(promoC).final)}</span></div><div className="sm-banner-image"><ProductImage src={promoC.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
            {promoD && <Link href={`/produto/${promoD.slug}`} className="sm-banner"><div><small>Diversos</small><strong>{promoD.name}</strong><span>A partir de {formatKz(priceOf(promoD).final)}</span></div><div className="sm-banner-image"><ProductImage src={promoD.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
          </div>

        </main>
      </div>
    </div>
  )
}

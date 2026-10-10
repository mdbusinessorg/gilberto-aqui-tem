import Link from '@/components/ui/navigation-link'
import Image from 'next/image'
import { ChevronRight, ArrowRight, Menu, Truck, ShieldCheck, RefreshCw, Smartphone, Laptop, Gamepad2, Headphones, Watch, Cable, Grid2X2 } from 'lucide-react'
import { ProductCard, ProductImage } from '@/components/store/product-card'
import { Reveal } from '@/components/store/reveal'
import { HeroSlider } from '@/components/store/hero-slider'
import { Stars } from '@/components/ui'
import { getProducts, getCategories, getBrands, getBanners } from '@/lib/store/queries'
import { priceOf } from '@/lib/store/price'
import { formatKz } from '@/lib/utils'
import { waLink, supportMessage } from '@/lib/whatsapp'

export const revalidate = 60

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  iphone: Smartphone, samsung: Smartphone, android: Smartphone, laptops: Laptop, macbook: Laptop,
  playstation: Gamepad2, airpods: Headphones, 'apple-watch': Watch, acessorios: Cable, audio: Headphones,
  monitores: Laptop, informatica: Laptop,
}

const CAT_PRIORITY = ['iphone', 'samsung', 'tablets', 'laptops', 'monitores', 'informatica', 'audio', 'acessorios', 'playstation', 'airpods', 'apple-watch', 'android', 'macbook', 'outros']
const CAT_IMG: Record<string, string> = {
  iphone: 'https://hfwshixqfhrnxwtixoqr.supabase.co/storage/v1/object/public/products/hero/web-hero-iphone.png',
  samsung: '/categorias/samsung.webp',
  tablets: '/categorias/tablets.webp',
  laptops: '/categorias/computadores.webp',
  monitores: '/categorias/monitores.webp',
  informatica: '/categorias/informatica.webp',
  acessorios: '/categorias/acessorios.webp',
}
const CAT_HREF: Record<string, string> = {
  laptops: '/loja?categorias=laptops,macbook',
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
  const slides = banners.length
    ? banners.map(b => ({ title: b.title ?? '', sub: b.subtitle, cta: b.cta_label, href: b.link_url ?? '/loja', image: b.image_url }))
    : [{ title: 'Novidades', sub: 'Os melhores preços de Luanda', cta: 'Comprar agora', href: '/loja', image: phones.products[0]?.image_url ?? '/promotions/iphone-x-hero.webp' }]
  const heroPhone = phones.products.find(p => /iphone x/i.test(p.name ?? '')) ?? phones.products[0]
  const byCat = (slugs: string[], n = 4) => allProducts.products.filter(p => slugs.includes(p.category_slug ?? '')).slice(0, n)
  const destaques = allProducts.products.filter(p => p.is_featured).slice(0, 4)
  const smartphones = byCat(['iphone', 'samsung', 'android'])
  const monitores = byCat(['monitores'])
  const informatica = byCat(['informatica', 'laptops', 'macbook', 'tablets'])
  const somEGaming = byCat(['audio', 'playstation', 'airpods', 'apple-watch'])
  const acessorios = byCat(['acessorios', 'outros'])
  const promocoes = allProducts.products.filter(p => p.is_promo || (p.promo_price && p.promo_price < (p.price ?? 0))).slice(0, 4)
  const smartList = smartphones
  const deal = promos.products[0]
  const best = (popular.products.some(p => (p.sold_count ?? 0) > 0) ? popular.products : featured.products).slice(0, 3)
  const topCategories = categories.filter(c => !c.parent_id)
  const catImage = (slug: string) => allProducts.products.find(p => p.category_slug === slug)?.image_url ?? null
  const catCount = (slug: string) => allProducts.products.filter(p => p.category_slug === slug).length
  const catTiles = topCategories
    .map(c => ({
      slug: c.slug,
      name: c.slug === 'laptops' ? 'Computadores' : c.name,
      href: CAT_HREF[c.slug] ?? `/loja?categoria=${c.slug}`,
      img: CAT_IMG[c.slug] ?? catImage(c.slug),
      icon: CATEGORY_ICONS[c.slug] ?? Grid2X2,
      desc: `${catCount(c.slug)} ${catCount(c.slug) === 1 ? 'produto' : 'produtos'}`,
    }))
    .sort((a, b) => {
      const ia = CAT_PRIORITY.indexOf(a.slug), ib = CAT_PRIORITY.indexOf(b.slug)
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })
    .slice(0, 8)
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

          <HeroSlider slides={slides} />

          <Reveal>
            <section className="sm-cats3" aria-label="Categorias principais">
              <div className="sm-heading"><h2>Categorias</h2><Link href="/loja">Ver todas <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-cats3-grid">
                {catTiles.map(c => (
                  <Link key={c.slug} href={c.href} className="sm-cat3">
                    <span className="sm-cat3-img">
                      {c.img
                        ? <Image src={c.img} alt="" fill sizes="(max-width: 640px) 64px, 96px" style={{ objectFit: 'contain' }} />
                        : <span className="sm-cat3-ico"><c.icon className="h-8 w-8" /></span>}
                    </span>
                    <span className="sm-cat3-txt"><strong>{c.name}</strong><small>{c.desc}</small></span>
                    <ChevronRight className="h-4 w-4 sm-cat3-arrow" />
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
          <div className="sm-banners">
            {promoA && <Link href={`/produto/${promoA.slug}`} className="sm-banner"><div><small>Áudio</small><strong>{promoA.name}</strong><span>Comprar</span></div><div className="sm-banner-image"><ProductImage src={promoA.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
            {promoB && <Link href={`/produto/${promoB.slug}`} className="sm-banner"><div><small>Diversos</small><strong>{promoB.name}</strong><span>Comprar</span></div><div className="sm-banner-image"><ProductImage src={promoB.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
          </div>
          </Reveal>

          {destaques.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Destaques</h2><Link href="/loja?destaques=1">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{destaques.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          {smartList.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Smartphones</h2><Link href="/loja?categoria=iphone">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{smartList.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          {monitores.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Monitores & Visuais</h2><Link href="/categoria/monitores">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{monitores.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          {informatica.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Informática</h2><Link href="/categoria/informatica">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{informatica.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          {somEGaming.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Áudio & PlayStation</h2><Link href="/categoria/audio">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{somEGaming.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          {heroPhone && (
            <Reveal><Link href={`/produto/${heroPhone.slug}`} className="sm-wide">
              <span className="sm-wide-tag">A partir de<br /><strong>{formatKz(priceOf(heroPhone).final)}</strong></span>
              <div><h3>{heroPhone.name}</h3><p>Diz olá ao futuro.</p></div>
              <div className="sm-wide-image"><ProductImage src={heroPhone.image_url} alt="" className="h-full w-full" sizes="300px" /></div>
            </Link></Reveal>
          )}

          {acessorios.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Acessórios</h2><Link href="/categoria/acessorios">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{acessorios.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section></Reveal>
          )}

          {promocoes.length > 0 && (
            <Reveal><section className="sm-section">
              <div className="sm-heading"><h2>Em promoção</h2><Link href="/loja?promo=1">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{promocoes.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
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

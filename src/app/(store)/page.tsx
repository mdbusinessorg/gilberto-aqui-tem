import Link from '@/components/ui/navigation-link'
import Image from 'next/image'
import { ChevronRight, ChevronLeft, Menu, Truck, ShieldCheck, RefreshCw, Smartphone, Laptop, Gamepad2, Headphones, Watch, Cable, Grid2X2 } from 'lucide-react'
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
const TABS = [
  { key: 'novidades', label: 'Novidades' },
  { key: 'destaques', label: 'Destaques' },
  { key: 'promocoes', label: 'Promoções' },
  { key: 'diversos', label: 'Diversos' },
] as const
type TabKey = (typeof TABS)[number]['key']

export default async function HomePage({ searchParams }: { searchParams?: { aba?: string } }) {
  const tab: TabKey = TABS.some(t => t.key === searchParams?.aba) ? (searchParams!.aba as TabKey) : 'novidades'
  const [recent, featured, promos, misc, popular, phones, audio, categories, brands, banners] = await Promise.all([
    getProducts({ sort: 'recent', inStock: true, perPage: 3 }),
    getProducts({ featured: true, inStock: true, perPage: 3 }),
    getProducts({ promo: true, inStock: true, perPage: 3 }),
    getProducts({ categories: ['acessorios', 'apple-watch', 'airpods', 'playstation', 'laptops', 'macbook'], inStock: true, perPage: 3 }),
    getProducts({ sort: 'popular', inStock: true, perPage: 3 }),
    getProducts({ categories: ['iphone', 'samsung', 'android'], inStock: true, perPage: 4 }),
    getProducts({ category: 'audio', inStock: true, perPage: 4 }),
    getCategories(), getBrands(), getBanners(),
  ])
  const tabProducts: Record<TabKey, typeof recent.products> = { novidades: recent.products, destaques: featured.products, promocoes: promos.products, diversos: misc.products }
  const shown = tabProducts[tab].length ? tabProducts[tab] : recent.products
  const banner = banners[0]
  const heroImage = banner?.image_url || '/promotions/iphone-x-hero.webp'
  const heroPhone = phones.products.find(p => /iphone x/i.test(p.name ?? '')) ?? phones.products[0]
  const deal = promos.products[0]
  const best = (popular.products.some(p => (p.sold_count ?? 0) > 0) ? popular.products : featured.products).slice(0, 3)
  const topCategories = categories.filter(c => !c.parent_id).slice(0, 7)
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
              <h1>{banner?.title ?? heroPhone?.name ?? 'iPhone'}</h1>
              <p>{banner?.subtitle ?? 'Já disponível na Gilberto Aqui Tem'}</p>
              <div><Link href={banner?.link_url ?? (heroPhone ? `/produto/${heroPhone.slug}` : '/loja')}>Saber mais</Link><span>|</span><Link href={heroPhone ? `/produto/${heroPhone.slug}` : '/loja'}>Comprar</Link></div>
            </div>
            <Image src={heroImage} alt="" fill priority sizes="(max-width: 1023px) 100vw, 820px" className="sm-hero-image" />
            <div className="sm-dots"><i className="on" /><i /></div>
          </section>

          <div className="sm-tabs">
            <div>{TABS.map(t => <Link key={t.key} href={t.key === 'novidades' ? '/#tabs' : `/?aba=${t.key}#tabs`} className={t.key === tab ? 'active' : ''} id={t.key === tab ? 'tabs' : undefined}>{t.label}</Link>)}</div>
            <div className="sm-arrows"><Link href="/loja" aria-label="Ver loja"><ChevronLeft className="h-3.5 w-3.5" /></Link><Link href="/loja" aria-label="Ver loja"><ChevronRight className="h-3.5 w-3.5" /></Link></div>
          </div>
          <div className="sm-grid3">{shown.map(p => <ProductCard key={p.id} p={p} />)}</div>

          <div className="sm-banners">
            {promoA && <Link href={`/produto/${promoA.slug}`} className="sm-banner"><div><small>Áudio</small><strong>{promoA.name}</strong><span>Comprar</span></div><div className="sm-banner-image"><ProductImage src={promoA.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
            {promoB && <Link href={`/produto/${promoB.slug}`} className="sm-banner"><div><small>Diversos</small><strong>{promoB.name}</strong><span>Comprar</span></div><div className="sm-banner-image"><ProductImage src={promoB.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
          </div>

          {phones.products.length > 0 && (
            <section className="sm-section">
              <div className="sm-heading"><h2>Smartphones</h2><Link href="/loja?categoria=iphone">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid2">{phones.products.map(p => <ProductCard key={p.id} p={p} horizontal compact />)}</div>
            </section>
          )}

          {heroPhone && (
            <Link href={`/produto/${heroPhone.slug}`} className="sm-wide">
              <span className="sm-wide-tag">A partir de<br /><strong>{formatKz(priceOf(heroPhone).final)}</strong></span>
              <div><h3>{heroPhone.name}</h3><p>Diz olá ao futuro.</p></div>
              <div className="sm-wide-image"><ProductImage src={heroPhone.image_url} alt="" className="h-full w-full" sizes="300px" /></div>
            </Link>
          )}

          {audio.products.length > 0 && (
            <section className="sm-section">
              <div className="sm-heading"><h2>Áudio</h2><Link href="/categoria/audio">Ver todos <ChevronRight className="h-3.5 w-3.5" /></Link></div>
              <div className="sm-grid4">{audio.products.map(p => <ProductCard key={p.id} p={p} compact />)}</div>
            </section>
          )}

          <div className="sm-banners">
            {promoC && <Link href={`/produto/${promoC.slug}`} className="sm-banner"><div><small>Som</small><strong>{promoC.name}</strong><span>A partir de {formatKz(priceOf(promoC).final)}</span></div><div className="sm-banner-image"><ProductImage src={promoC.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
            {promoD && <Link href={`/produto/${promoD.slug}`} className="sm-banner"><div><small>Diversos</small><strong>{promoD.name}</strong><span>A partir de {formatKz(priceOf(promoD).final)}</span></div><div className="sm-banner-image"><ProductImage src={promoD.image_url} alt="" className="h-full w-full p-2" sizes="160px" /></div></Link>}
          </div>

          <nav aria-label="Marcas" className="sm-brands">
            {brands.filter(b => ['apple', 'samsung', 'sony', 'dell', 'jbl', 'hp'].includes(b.slug)).map(b => <Link key={b.id} href={`/loja?marca=${b.slug}`}>{b.name}</Link>)}
          </nav>
        </main>
      </div>
    </div>
  )
}

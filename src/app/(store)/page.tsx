import Link from '@/components/ui/navigation-link'
import Image from 'next/image'
import { ChevronRight, MessageCircle, RefreshCw, ShieldCheck, Smartphone, Laptop, Gamepad2, Headphones, Watch, Cable, Grid2X2 } from 'lucide-react'
import { ProductCard } from '@/components/store/product-card'
import type { HeroSlide } from '@/components/store/home-showcase'
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
  const [recent, featured, promos, popular, phones, audio, categories, brands, banners] = await Promise.all([
    getProducts({ sort: 'recent', inStock: true, perPage: 9 }),
    getProducts({ featured: true, inStock: true, perPage: 9 }),
    getProducts({ promo: true, inStock: true, perPage: 9 }),
    getProducts({ sort: 'popular', inStock: true, perPage: 3 }),
    getProducts({ categories: ['iphone', 'samsung', 'android'], inStock: true, perPage: 4 }),
    getProducts({ category: 'audio', inStock: true, perPage: 4 }),
    getCategories(), getBrands(), getBanners(),
  ])
  const hasSales = popular.products.some(p => (p.sold_count ?? 0) > 0)
  const selections = hasSales ? popular.products : featured.products.slice(0, 3)
  const deal = promos.products[0]
  const hero: HeroSlide[] = banners.length ? banners.map(b => ({
    title: b.title, subtitle: b.subtitle ?? 'Novidades na Gilberto Aqui Tem',
    image: b.image_url || '/promotions/iphone-x-hero.webp', href: b.link_url ?? '/loja', label: b.cta_label ?? 'Ver produtos',
  })) : [
    { title: 'iPhone X', subtitle: 'Encontra o teu próximo iPhone aqui.', image: '/promotions/iphone-x-hero.webp', href: '/loja?q=iPhone+X', label: 'Ver iPhone X', phone: true },
    { title: 'Apple Watch', subtitle: 'Tecnologia que acompanha o teu ritmo.', image: '/products/apple-watch.webp', href: '/categoria/apple-watch', label: 'Descobrir' },
    { title: 'Som em cada detalhe.', subtitle: 'Colunas e auscultadores para a tua música.', image: '/products/beats-headphones.webp', href: '/categoria/audio', label: 'Explorar áudio' },
  ]

  const heroSlide = hero[0]
  const recommended = [...featured.products, ...recent.products].filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i).slice(0, 6)
  const topCategories = categories.filter(c => !c.parent_id).slice(0, 8)
  const sections = [
    { id: 'promo', title: 'Em promoção', href: '/loja?promo=1', products: promos.products.slice(0, 4) },
    { id: 'phones', title: 'Smartphones', href: '/loja?categoria=iphone', products: phones.products },
    { id: 'audio', title: 'Áudio', href: '/categoria/audio', products: audio.products },
  ].filter(s => s.products.length > 0)

  return (
    <div className="ios-home">
      <div className="shell">
        <section aria-label="Destaque" className="ios-hero">
          <Image src={heroSlide.image} alt="" fill priority sizes="(max-width: 767px) 100vw, 1100px" className="ios-hero-image" />
          <div className="ios-hero-copy">
            <p className="ios-hero-eyebrow">Gilberto Aqui Tem</p>
            <h1>{heroSlide.title}</h1>
            <p>{heroSlide.subtitle}</p>
            <Link href={heroSlide.href} className="ios-pill">{heroSlide.label} <ChevronRight className="h-3.5 w-3.5" /></Link>
          </div>
          {deal && <Link href={`/produto/${deal.slug}`} className="ios-hero-deal"><span>Oferta</span><strong>{formatKz(priceOf(deal).final)}</strong>{deal.name}</Link>}
        </section>

        <section aria-labelledby="cat-title" className="ios-section">
          <div className="ios-heading"><h2 id="cat-title">Categorias</h2><Link href="/loja">Ver todas</Link></div>
          <div className="ios-chips">
            {topCategories.map(c => { const Icon = CATEGORY_ICONS[c.slug] ?? Grid2X2; return <Link key={c.id} href={`/categoria/${c.slug}`} className="ios-chip"><span><Icon className="h-4 w-4" /></span>{c.name}</Link> })}
          </div>
        </section>

        <section aria-labelledby="rec-title" className="ios-section">
          <div className="ios-heading"><h2 id="rec-title">Recomendados</h2><Link href="/loja?ordem=popular">Ver todos</Link></div>
          <div className="ios-grid">{recommended.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </section>

        {sections.map(s => <section key={s.id} aria-labelledby={`${s.id}-title`} className="ios-section">
          <div className="ios-heading"><h2 id={`${s.id}-title`}>{s.title}</h2><Link href={s.href}>Ver todos</Link></div>
          <div className="ios-grid">{s.products.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </section>)}

        <section className="ios-section ios-services">
          {[
            { icon: MessageCircle, title: 'Atendimento directo', text: 'Fala connosco no WhatsApp', href: waLink(supportMessage()) },
            { icon: RefreshCw, title: 'Compramos e trocamos', text: 'Pede a avaliação do teu aparelho', href: '/trocas' },
            { icon: ShieldCheck, title: 'Compra com informação', text: 'Estado e garantia na ficha', href: '/loja' },
          ].map(service => <Link key={service.title} href={service.href} className="ios-service"><span><service.icon className="h-5 w-5" /></span><div><strong>{service.title}</strong><p>{service.text}</p></div></Link>)}
        </section>

        <nav aria-label="Marcas disponíveis" className="ios-brands">
          {brands.filter(b => ['apple', 'samsung', 'sony', 'dell', 'jbl', 'hp'].includes(b.slug)).map(b => <Link key={b.id} href={`/loja?marca=${b.slug}`}>{b.name}</Link>)}
        </nav>
      </div>
    </div>
  )
}

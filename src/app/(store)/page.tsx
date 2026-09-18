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

  const explore = deal ?? featured.products[0] ?? recent.products[0]
  const heroImage = hero[0]
  const featureProducts = [...featured.products, ...recent.products].filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i).slice(0, 6)
  const topCategories = categories.filter(c => !c.parent_id).slice(0, 8)

  return (
    <div className="dark-home">
      <div className="shell">
        <section className="dark-home-explore" aria-labelledby="explore-title">
          <h1 id="explore-title">Explora os novos produtos</h1>
          <div className="dark-home-hero-row">
            {explore && <Link href={`/produto/${explore.slug}`} className="dark-home-hero-card">
              <div className="dark-home-hero-image"><Image src={explore.image_url || heroImage.image} alt={explore.name ?? ''} fill priority sizes="(max-width: 767px) 80vw, 560px" className="object-contain p-4" /></div>
              <div className="dark-home-hero-copy">
                <p><strong>{explore.name}</strong><br />{priceOf(explore).active ? `Agora ${formatKz(priceOf(explore).final)}` : `Desde ${formatKz(priceOf(explore).final)}`}</p>
                <span className="dark-home-button">Ver</span>
              </div>
            </Link>}
            <Link href={heroImage.href} className="dark-home-hero-card dark-home-hero-secondary">
              <div className="dark-home-hero-image"><Image src={heroImage.image} alt="" fill sizes="(max-width: 767px) 80vw, 560px" className="object-contain p-4" /></div>
              <div className="dark-home-hero-copy"><p><strong>{heroImage.title}</strong><br />{heroImage.subtitle}</p><span className="dark-home-button">{heroImage.label}</span></div>
            </Link>
          </div>
        </section>

        <section aria-labelledby="category-title" className="dark-home-section">
          <h2 id="category-title">Categorias</h2>
          <div className="dark-home-categories">
            {topCategories.map(c => {
              const Icon = CATEGORY_ICONS[c.slug] ?? Grid2X2
              return <Link key={c.id} href={`/categoria/${c.slug}`} className="dark-home-category"><span><Icon className="h-7 w-7" /></span>{c.name}</Link>
            })}
          </div>
        </section>

        <section aria-labelledby="feature-title" className="dark-home-section">
          <div className="dark-home-heading"><h2 id="feature-title">Produtos em destaque</h2><Link href="/loja">Ver todos <ChevronRight className="h-4 w-4" /></Link></div>
          <div className="dark-home-grid">{featureProducts.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </section>

        {promos.products.length > 0 && <section aria-labelledby="promo-title" className="dark-home-section">
          <div className="dark-home-heading"><h2 id="promo-title">Em promoção</h2><Link href="/loja?promo=1">Ver todas <ChevronRight className="h-4 w-4" /></Link></div>
          <div className="dark-home-grid">{promos.products.slice(0, 6).map(p => <ProductCard key={p.id} p={p} />)}</div>
        </section>}

        {phones.products.length > 0 && <section aria-labelledby="phones-title" className="dark-home-section">
          <div className="dark-home-heading"><h2 id="phones-title">Smartphones</h2><Link href="/loja?categoria=iphone">Ver todos <ChevronRight className="h-4 w-4" /></Link></div>
          <div className="dark-home-grid">{phones.products.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </section>}

        {audio.products.length > 0 && <section aria-labelledby="audio-title" className="dark-home-section">
          <div className="dark-home-heading"><h2 id="audio-title">Áudio</h2><Link href="/categoria/audio">Ver todos <ChevronRight className="h-4 w-4" /></Link></div>
          <div className="dark-home-grid">{audio.products.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </section>}

        <section className="dark-home-section dark-home-services">
          {[
            { icon: MessageCircle, title: 'Atendimento directo', text: 'Fala connosco no WhatsApp', href: waLink(supportMessage()) },
            { icon: RefreshCw, title: 'Compramos e trocamos', text: 'Pede a avaliação do teu aparelho', href: '/trocas' },
            { icon: ShieldCheck, title: 'Compra com informação', text: 'Estado e garantia na ficha', href: '/loja' },
          ].map(service => <Link key={service.title} href={service.href} className="dark-home-service"><span><service.icon className="h-5 w-5" /></span><div><strong>{service.title}</strong><p>{service.text}</p></div></Link>)}
        </section>

        <nav aria-label="Marcas disponíveis" className="dark-home-brands">
          {brands.filter(b => ['apple', 'samsung', 'sony', 'dell', 'jbl', 'hp'].includes(b.slug)).map(b => <Link key={b.id} href={`/loja?marca=${b.slug}`}>{b.name}</Link>)}
        </nav>
      </div>
    </div>
  )
}

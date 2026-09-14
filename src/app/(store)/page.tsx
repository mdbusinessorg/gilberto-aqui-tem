import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight, MessageCircle, RefreshCw, ShieldCheck, Smartphone, Laptop, Gamepad2, Headphones, Watch, Cable, Grid2X2 } from 'lucide-react'
import { ProductCard } from '@/components/store/product-card'
import { HomeHero, HomeProductTabs, type HeroSlide } from '@/components/store/home-showcase'
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

  return (
    <div className="reference-home shell">
      <div className="home-layout">
        <aside className="home-sidebar">
          <nav aria-label="Categorias de produtos" className="home-categories">
            <div className="home-category-title"><Grid2X2 className="h-4 w-4" /> Comprar por categoria</div>
            <ul>
              {categories.filter(c => !c.parent_id).map(c => {
                const Icon = CATEGORY_ICONS[c.slug] ?? Grid2X2
                return <li key={c.id}><Link href={`/categoria/${c.slug}`}><Icon className="h-5 w-5 shrink-0" /><span>{c.name}</span><ChevronRight className="ml-auto h-3 w-3" /></Link></li>
              })}
            </ul>
          </nav>

          {deal && <section className="home-deal home-sidebar-box">
            <SectionHeading title="Ofertas especiais" href="/loja?promo=1" />
            <ProductCard p={deal} />
            {priceOf(deal).active && <p className="deal-saving">Poupa <strong>{formatKz(priceOf(deal).price - priceOf(deal).final)}</strong></p>}
            <Link href={`/produto/${deal.slug}`} className="deal-link">Aproveitar oferta <ArrowRight className="h-3 w-3" /></Link>
          </section>}

          <section className="home-sidebar-box home-selections">
            <SectionHeading title={hasSales ? 'Mais vendidos' : 'Escolhas da loja'} href="/loja?ordem=popular" />
            {selections.map(p => <ProductCard key={p.id} p={p} horizontal compact />)}
          </section>

          <section className="home-sidebar-box home-store-story">
            <SectionHeading title="Aqui também trocamos" href="/trocas" />
            <div className="relative mx-3 aspect-[4/3] bg-surface"><Image src="/products/iphone-x.webp" alt="iPhone para troca" fill sizes="240px" className="object-contain p-5 mix-blend-multiply" /></div>
            <h3>O teu próximo telemóvel começa aqui.</h3>
            <p>Compramos, vendemos e trocamos. Envia os dados do teu aparelho e pede uma avaliação à nossa equipa.</p>
            <Link href="/trocas">Saber mais <ArrowRight className="h-3 w-3" /></Link>
          </section>

          <div className="home-service-list">
            {[
              { icon: MessageCircle, title: 'Atendimento directo', text: 'Fala connosco no WhatsApp', href: waLink(supportMessage()) },
              { icon: RefreshCw, title: 'Compramos e trocamos', text: 'Pede a avaliação do teu aparelho', href: '/trocas' },
              { icon: ShieldCheck, title: 'Compra com informação', text: 'Estado e garantia na ficha', href: '/loja' },
            ].map(service => <Link key={service.title} href={service.href} className="home-service"><span><service.icon className="h-5 w-5" /></span><div><strong>{service.title}</strong><p>{service.text}</p></div></Link>)}
          </div>
        </aside>

        <div className="home-main">
          <HomeHero slides={hero} />
          <HomeProductTabs tabs={[{ label: 'Novidades', products: recent.products }, { label: 'Em destaque', products: featured.products }, { label: 'Em promoção', products: promos.products }]} />

          <div className="home-banner-pair">
            <PromoBanner eyebrow="Som de estúdio" title="Colunas & áudio" image="/products/yamaha-speaker.webp" href="/categoria/audio" />
            <PromoBanner eyebrow="Pequeno no tamanho" title="Dell Studio Hybrid" image="/products/dell-hybrid.webp" href="/loja?q=Dell+Studio+Hybrid" />
          </div>

          <section className="home-phones">
            <SectionHeading title="Smartphones" href="/loja?categoria=iphone" />
            <div className="home-phone-grid">{phones.products.map(p => <ProductCard key={p.id} p={p} horizontal />)}</div>
          </section>

          <Link href="/loja?q=iPhone+X" className="home-iphone-banner">
            <span className="iphone-banner-pill">COMPRAMOS<br /><strong>E TROCAMOS</strong></span>
            <span className="relative z-10"><strong>iPhone X</strong><span>O teu próximo iPhone está aqui.</span></span>
            <Image src="/promotions/iphone-x-hero.webp" alt="" fill sizes="(max-width: 767px) 100vw, 850px" className="iphone-banner-image" />
          </Link>

          {audio.products.length > 0 && <section className="home-audio">
            <SectionHeading title="Áudio" href="/categoria/audio" />
            <div className="home-audio-grid">{audio.products.map(p => <ProductCard key={p.id} p={p} />)}</div>
          </section>}
        </div>
      </div>

      <div className="home-bottom-banners">
        <PromoBanner eyebrow="Som para o teu espaço" title="Colunas Logitech" image="/products/logitech-speakers.webp" href="/loja?q=Logitech" />
        <PromoBanner eyebrow="Uma nova perspectiva" title="DJI Mavic Pro" image="/products/dji-mavic.webp" href="/loja?q=DJI+Mavic" />
      </div>

      <nav aria-label="Marcas disponíveis" className="home-brands">
        {brands.filter(b => ['apple', 'samsung', 'sony', 'dell', 'jbl', 'hp'].includes(b.slug)).map(b => <Link key={b.id} href={`/loja?marca=${b.slug}`} className={`brand-wordmark brand-${b.slug}`}>{b.name}</Link>)}
      </nav>
    </div>
  )
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return <div className="home-section-heading"><h2>{title}</h2><span /><Link href={href} aria-label={`Ver todos: ${title}`}><ChevronRight className="h-4 w-4" /></Link></div>
}

function PromoBanner({ eyebrow, title, image, href }: { eyebrow: string; title: string; image: string; href: string }) {
  return <Link href={href} className="home-promo"><Image src={image} alt="" fill sizes="(max-width: 767px) 90vw, 480px" className="promo-image" /><div><p>{eyebrow}</p><h3>{title}</h3><span>Comprar agora <ArrowRight className="h-3 w-3" /></span></div></Link>
}

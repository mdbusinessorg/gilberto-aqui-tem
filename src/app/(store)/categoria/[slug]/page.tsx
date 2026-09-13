import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProducts, getCategories } from '@/lib/store/queries'
import { ProductGrid } from '@/components/store/product-card'
import { EmptyState } from '@/components/ui'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cats = await getCategories()
  const cat = cats.find((c) => c.slug === params.slug)
  return { title: cat ? cat.name : 'Categoria' }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const cats = await getCategories()
  const cat = cats.find((c) => c.slug === params.slug)
  if (!cat) notFound()
  const { products, total } = await getProducts({ category: cat.slug, perPage: 48 })
  return (
    <div className="shell py-8">
      <nav className="text-xs text-ink-muted"><Link href="/" className="hover:text-ink">Início</Link> / <Link href="/loja" className="hover:text-ink">Loja</Link> / <span className="text-ink">{cat.name}</span></nav>
      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{cat.name}</h1>
        {cat.description && <p className="mt-1 text-sm text-ink-muted">{cat.description}</p>}
        <p className="mt-1 text-sm text-ink-muted">{total} {total === 1 ? 'produto' : 'produtos'}</p>
      </div>
      {products.length === 0
        ? <EmptyState title="Sem produtos nesta categoria" description="Explora a loja completa ou fala connosco no WhatsApp." action={<Link href="/loja" className="text-sm font-medium text-brand-700">Ver toda a loja</Link>} className="rounded-lg border border-dashed border-line" />
        : <ProductGrid products={products} />}
    </div>
  )
}

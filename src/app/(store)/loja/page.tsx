import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getProducts, getCategories, getBrands, type ProductFilters } from '@/lib/store/queries'
import { ProductGrid } from '@/components/store/product-card'
import { EmptyState, Input, Select, Button } from '@/components/ui'

export const metadata: Metadata = { title: 'Loja' }
export const revalidate = 60

export default async function ShopPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const filters: ProductFilters = {
    q: searchParams.q, category: searchParams.categoria, brand: searchParams.marca,
    condition: searchParams.estado, min: searchParams.min ? Number(searchParams.min) : undefined,
    max: searchParams.max ? Number(searchParams.max) : undefined,
    sort: (searchParams.ordem as ProductFilters['sort']) || 'recent',
    featured: searchParams.destaque === '1', promo: searchParams.promo === '1',
    inStock: searchParams.stock !== 'todos', page: searchParams.pag ? Number(searchParams.pag) : 1,
  }
  const [{ products, total, page, perPage }, categories, brands] = await Promise.all([getProducts(filters), getCategories(), getBrands()])
  const pages = Math.ceil(total / perPage)
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    Object.entries({ ...searchParams, ...patch }).forEach(([k, v]) => { if (v != null && v !== '') p.set(k, v) })
    return `/loja?${p.toString()}`
  }

  return (
    <div className="shell py-8">
      <div className="mb-6">
        <nav className="text-xs text-ink-muted"><Link href="/" className="hover:text-ink">Início</Link> / <span className="text-ink">Loja</span></nav>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{filters.q ? `Resultados para “${filters.q}”` : 'Todos os produtos'}</h1>
        <p className="mt-1 text-sm text-ink-muted">{total} {total === 1 ? 'produto' : 'produtos'}</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-56 shrink-0">
          <form className="grid grid-cols-2 gap-3 lg:grid-cols-1" action="/loja">
            {filters.q && <input type="hidden" name="q" value={filters.q} />}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Categoria</p>
              <Select name="categoria" defaultValue={filters.category ?? ''}>
                <option value="">Todas</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Marca</p>
              <Select name="marca" defaultValue={filters.brand ?? ''}>
                <option value="">Todas</option>
                {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Estado</p>
              <Select name="estado" defaultValue={filters.condition ?? ''}>
                <option value="">Todos</option>
                <option value="novo">Novo</option>
                <option value="recondicionado">Recondicionado</option>
                <option value="usado">Usado</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Preço min (Kz)</p>
                <Input name="min" type="number" min={0} defaultValue={filters.min ?? ''} placeholder="0" />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Máx (Kz)</p>
                <Input name="max" type="number" min={0} defaultValue={filters.max ?? ''} placeholder="∞" />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Stock</p>
              <Select name="stock" defaultValue={searchParams.stock ?? ''}>
                <option value="">Só em stock</option>
                <option value="todos">Incluir esgotados</option>
              </Select>
            </div>
            <Button type="submit" className="col-span-2 lg:col-span-1">Filtrar</Button>
            <Link href="/loja" className="col-span-2 text-center text-xs text-ink-muted hover:text-ink lg:col-span-1">Limpar filtros</Link>
          </form>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-muted">{total} resultados</p>
            <form action="/loja" className="flex items-center gap-2">
              {Object.entries(searchParams).filter(([k]) => k !== 'ordem' && k !== 'pag').map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
              <label className="text-xs text-ink-muted">Ordenar:</label>
              <Select name="ordem" defaultValue={filters.sort} onChange={undefined} className="h-8 w-auto text-xs" aria-label="Ordenar">
                <option value="recent">Mais recentes</option>
                <option value="popular">Mais vendidos</option>
                <option value="rating">Melhor avaliados</option>
                <option value="price_asc">Preço: mais baixo</option>
                <option value="price_desc">Preço: mais alto</option>
              </Select>
              <Button type="submit" size="sm" variant="outline">Aplicar</Button>
            </form>
          </div>

          {products.length === 0 ? (
            <EmptyState title="Sem produtos" description="Não encontrámos produtos com estes filtros. Tenta ajustar a pesquisa ou fala connosco no WhatsApp." className="rounded-lg border border-dashed border-line" />
          ) : (
            <ProductGrid products={products} />
          )}

          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && <Link href={qs({ pag: String(page - 1) })} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line hover:bg-surface"><ChevronLeft className="h-4 w-4" /></Link>}
              {Array.from({ length: pages }).slice(0, 7).map((_, i) => (
                <Link key={i} href={qs({ pag: String(i + 1) })} className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm ${i + 1 === page ? 'bg-brand-600 text-white' : 'border border-line hover:bg-surface'}`}>{i + 1}</Link>
              ))}
              {page < pages && <Link href={qs({ pag: String(page + 1) })} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line hover:bg-surface"><ChevronRight className="h-4 w-4" /></Link>}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}

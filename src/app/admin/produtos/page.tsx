import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCategories, getBrands } from '@/lib/store/queries'
import { PageHeader, Card, Table, THead, TBody, StatusBadge, Badge, EmptyState, Input, Select, Button } from '@/components/ui'
import { formatKz } from '@/lib/utils'
import { CONDITION } from '@/lib/labels'
import { ProductForm } from './form'
import { ProductRowActions } from './row-actions'

export const dynamic = 'force-dynamic'

export default async function ProductsAdminPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient()
  let q = supabase.from('products').select('*, categories(name), brands(name), product_images(*)').order('created_at', { ascending: false }).limit(200)
  if (searchParams.q) q = q.or(`name.ilike.%${searchParams.q}%,sku.ilike.%${searchParams.q}%`)
  if (searchParams.categoria) q = q.eq('category_id', searchParams.categoria)
  if (searchParams.stock === 'baixo') q = q.lte('stock_total', 3)
  const [{ data: products }, categories, brands] = await Promise.all([q, getCategories(), getBrands()])

  return (
    <>
      <PageHeader title="Produtos" description={`${products?.length ?? 0} produtos`}
        actions={<ProductForm categories={categories} brands={brands} />} />
      <Card>
        <form className="flex flex-wrap items-end gap-3 border-b border-line p-4">
          <div className="min-w-48 flex-1"><Input name="q" placeholder="Nome ou SKU" defaultValue={searchParams.q} /></div>
          <Select name="categoria" defaultValue={searchParams.categoria ?? ''} className="w-44"><option value="">Todas as categorias</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <Select name="stock" defaultValue={searchParams.stock ?? ''} className="w-40"><option value="">Stock: todos</option><option value="baixo">Stock baixo</option></Select>
          <Button type="submit" variant="outline">Filtrar</Button>
        </form>
        <Table>
          <THead><tr><th>Produto</th><th>SKU</th><th>Categoria</th><th>Estado</th><th>Stock</th><th className="text-right">Preço</th><th className="text-right">Custo</th><th></th></tr></THead>
          <TBody>
            {(products ?? []).map((p) => {
              const images = [...p.product_images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
              const img = images[0]?.url
              return (
                <tr key={p.id}>
                  <td><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface text-ink-muted">{img ? <Image src={img} alt={p.name} width={36} height={36} unoptimized className="h-9 w-9 object-contain" /> : <Package className="h-4 w-4" />}</span><span className="font-medium">{p.name}{p.is_featured && <Badge tone="blue" className="ml-2">Destaque</Badge>}</span></div></td>
                  <td className="text-xs text-ink-muted">{p.sku}</td>
                  <td className="text-ink-muted">{p.categories?.name ?? '—'}</td>
                  <td><StatusBadge map={CONDITION} value={p.condition} /></td>
                  <td><span className={`tabular font-medium ${p.stock_total === 0 ? 'text-red-600' : p.stock_total <= p.min_stock ? 'text-amber-600' : ''}`}>{p.stock_total}</span></td>
                  <td className="text-right tabular">{formatKz(p.price)}{p.promo_price && <span className="block text-xs text-emerald-600 tabular">{formatKz(p.promo_price)} promo</span>}</td>
                  <td className="text-right tabular text-ink-muted">{p.cost_price != null ? formatKz(p.cost_price) : '—'}</td>
                  <td><ProductRowActions product={p} images={images} categories={categories} brands={brands} /></td>
                </tr>
              )
            })}
          </TBody>
        </Table>
        {!products?.length && <EmptyState compact title="Sem produtos" description="Adiciona o primeiro produto para começar a vender." />}
      </Card>
    </>
  )
}

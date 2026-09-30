import type { MetadataRoute } from 'next'
import { getProducts, getCategories } from '@/lib/store/queries'

const BASE = 'https://gilbertoaquitem.com'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, categories] = await Promise.all([getProducts({ perPage: 500 }), getCategories()])
  const fixed = ['', '/loja', '/trocas', '/sobre', '/contacto'].map(p => ({ url: `${BASE}${p}`, changeFrequency: 'daily' as const, priority: p === '' ? 1 : 0.8 }))
  return [
    ...fixed,
    ...categories.map(c => ({ url: `${BASE}/categoria/${c.slug}`, changeFrequency: 'daily' as const, priority: 0.7 })),
    ...products.map(p => ({ url: `${BASE}/produto/${p.slug}`, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ]
}

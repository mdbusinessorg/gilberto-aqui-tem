import { getStore } from '@netlify/blobs'

export type ProductMetrics = Record<string, { views: number; favs: number }>

const STORE = 'product-metrics'
const KEY = 'metrics'

export async function getMetrics(): Promise<ProductMetrics> {
  try {
    const store = getStore({ name: STORE })
    return ((await store.get(KEY, { type: 'json' })) as ProductMetrics | null) ?? {}
  } catch {
    return {}
  }
}

export async function bumpMetric(productId: string, type: 'views' | 'favs'): Promise<void> {
  try {
    const store = getStore({ name: STORE })
    const m = ((await store.get(KEY, { type: 'json' })) as ProductMetrics | null) ?? {}
    m[productId] = m[productId] ?? { views: 0, favs: 0 }
    m[productId][type] += 1
    await store.setJSON(KEY, m)
  } catch {
    /* storage indisponível (ex.: dev local sem contexto Netlify) — não falhar o pedido */
  }
}

export type StoreReview = {
  id: string
  product_id: string
  product_name: string
  author_name: string
  rating: number
  comment: string
  photo?: string | null
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'oculta'
  order_number?: string
  created_at: string
}

const REVIEWS_KEY = 'reviews'

export async function getStoreReviews(): Promise<StoreReview[]> {
  try {
    const store = getStore({ name: STORE })
    return ((await store.get(REVIEWS_KEY, { type: 'json' })) as StoreReview[] | null) ?? []
  } catch {
    return []
  }
}

export async function addStoreReview(r: StoreReview): Promise<void> {
  const store = getStore({ name: STORE })
  const list = ((await store.get(REVIEWS_KEY, { type: 'json' })) as StoreReview[] | null) ?? []
  list.unshift(r)
  await store.setJSON(REVIEWS_KEY, list)
}

export async function setStoreReviewStatus(id: string, status: StoreReview['status']): Promise<boolean> {
  const store = getStore({ name: STORE })
  const list = ((await store.get(REVIEWS_KEY, { type: 'json' })) as StoreReview[] | null) ?? []
  const i = list.findIndex((r) => r.id === id)
  if (i < 0) return false
  list[i] = { ...list[i], status }
  await store.setJSON(REVIEWS_KEY, list)
  return true
}

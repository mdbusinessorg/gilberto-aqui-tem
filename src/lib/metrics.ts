import { getStore } from '@netlify/blobs'

export type ProductMetrics = Record<string, { views: number; favs: number }>

const STORE = 'product-metrics'
const KEY = 'metrics'
const READ_TIMEOUT_MS = 1800
const WRITE_TIMEOUT_MS = 4000

function store() {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID
  const token = process.env.NETLIFY_BLOBS_TOKEN
  return siteID && token
    ? getStore({ name: STORE, siteID, token })
    : getStore({ name: STORE })
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))])
}

export async function getMetrics(): Promise<ProductMetrics> {
  try {
    return (await withTimeout(store().get(KEY, { type: 'json' }) as Promise<ProductMetrics | null>, READ_TIMEOUT_MS, null)) ?? {}
  } catch {
    return {}
  }
}

export async function bumpMetric(productId: string, type: 'views' | 'favs'): Promise<void> {
  try {
    const run = (async () => {
      const m = ((await store().get(KEY, { type: 'json' })) as ProductMetrics | null) ?? {}
      m[productId] = m[productId] ?? { views: 0, favs: 0 }
      m[productId][type] += 1
      await store().setJSON(KEY, m)
    })()
    await withTimeout(run, WRITE_TIMEOUT_MS, undefined)
  } catch {
    /* storage indisponível — não falhar o pedido */
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
    return (await withTimeout(store().get(REVIEWS_KEY, { type: 'json' }) as Promise<StoreReview[] | null>, READ_TIMEOUT_MS, null)) ?? []
  } catch {
    return []
  }
}

export async function addStoreReview(r: StoreReview): Promise<void> {
  const run = (async () => {
    const list = ((await store().get(REVIEWS_KEY, { type: 'json' })) as StoreReview[] | null) ?? []
    list.unshift(r)
    await store().setJSON(REVIEWS_KEY, list)
  })()
  await withTimeout(run, WRITE_TIMEOUT_MS, undefined)
}

export async function setStoreReviewStatus(id: string, status: StoreReview['status']): Promise<boolean> {
  const list = await getStoreReviews()
  const i = list.findIndex((r) => r.id === id)
  if (i < 0) return false
  list[i] = { ...list[i], status }
  await withTimeout(store().setJSON(REVIEWS_KEY, list), WRITE_TIMEOUT_MS, undefined)
  return true
}

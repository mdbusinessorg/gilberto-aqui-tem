export type ProductMetrics = Record<string, { views: number; favs: number }>

const STORE = 'product-metrics'
const KEY = 'metrics'
const READ_TIMEOUT_MS = 1800
const WRITE_TIMEOUT_MS = 4000

function cfg() {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID
  const token = process.env.NETLIFY_BLOBS_TOKEN
  if (!siteID || !token) return null
  return { base: `https://api.netlify.com/api/v1/blobs/${siteID}/${STORE}`, auth: { Authorization: `Bearer ${token}` } }
}

async function blobGet(key: string, timeoutMs = READ_TIMEOUT_MS) {
  const c = cfg()
  if (!c) return null
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${c.base}/${key}`, { headers: c.auth, signal: ctrl.signal, cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

async function blobPut(key: string, value: unknown, timeoutMs = WRITE_TIMEOUT_MS) {
  const c = cfg()
  if (!c) return
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    await fetch(`${c.base}/${key}`, {
      method: 'PUT',
      headers: { ...c.auth, 'Content-Type': 'application/octet-stream' },
      body: JSON.stringify(value),
      signal: ctrl.signal,
    })
  } catch {
    /* storage indisponível — não falhar o pedido */
  } finally {
    clearTimeout(t)
  }
}

export async function getMetrics(): Promise<ProductMetrics> {
  return ((await blobGet(KEY)) as ProductMetrics | null) ?? {}
}

export async function bumpMetric(productId: string, type: 'views' | 'favs'): Promise<void> {
  const m = ((await blobGet(KEY, WRITE_TIMEOUT_MS)) as ProductMetrics | null) ?? {}
  m[productId] = m[productId] ?? { views: 0, favs: 0 }
  m[productId][type] += 1
  await blobPut(KEY, m)
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
  return ((await blobGet(REVIEWS_KEY)) as StoreReview[] | null) ?? []
}

export async function addStoreReview(r: StoreReview): Promise<void> {
  const list = ((await blobGet(REVIEWS_KEY, WRITE_TIMEOUT_MS)) as StoreReview[] | null) ?? []
  list.unshift(r)
  await blobPut(REVIEWS_KEY, list)
}

export async function setStoreReviewStatus(id: string, status: StoreReview['status']): Promise<boolean> {
  const list = await getStoreReviews()
  const i = list.findIndex((r) => r.id === id)
  if (i < 0) return false
  list[i] = { ...list[i], status }
  await blobPut(REVIEWS_KEY, list)
  return true
}

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

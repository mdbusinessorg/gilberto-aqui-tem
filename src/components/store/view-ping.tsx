'use client'
import { useEffect } from 'react'

export function ViewPing({ id }: { id: string }) {
  useEffect(() => {
    const k = `gat_v_${id}`
    try {
      const last = Number(localStorage.getItem(k) ?? 0)
      if (Date.now() - last < 24 * 3600 * 1000) return
      localStorage.setItem(k, String(Date.now()))
    } catch { /* private mode */ }
    void fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id, type: 'views' }),
    }).catch(() => {})
  }, [id])
  return null
}

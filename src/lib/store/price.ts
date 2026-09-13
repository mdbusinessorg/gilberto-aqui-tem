export function priceOf(p: { price?: number | string | null; promo_price?: number | string | null; is_promo?: boolean | null }) {
  const price = Number(p.price ?? 0)
  const promo = p.promo_price != null ? Number(p.promo_price) : null
  const active = !!p.is_promo && promo != null && promo > 0 && promo < price
  return { price, promo, active, final: active && promo != null ? promo : price, discount: active && promo != null ? Math.round((1 - promo / price) * 100) : 0 }
}

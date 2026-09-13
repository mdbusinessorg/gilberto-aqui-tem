import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
export { priceOf } from './price'


export type StorefrontProduct = Database['public']['Views']['storefront_products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Banner = Database['public']['Tables']['banners']['Row']

export type StoreSettings = {
  name: string; tagline: string; whatsapp: string; instagram: string; facebook: string; email: string; address: string; hours: string
}
export type CheckoutSettings = { delivery_fee: number; payment_methods: string[]; guest_checkout: boolean }
export type LoyaltySettings = { enabled: boolean; points_per_1000: number; kz_per_point: number; min_redeem_points: number; silver_threshold: number; gold_threshold: number; vip_threshold: number; birthday_coupon_percent: number }
export type WheelSettings = { enabled: boolean; cooldown_hours: number; requires_purchase: boolean }

const DEFAULT_STORE: StoreSettings = { name: 'Gilberto Aqui Tem', tagline: 'Telemóvel & Acessórios', whatsapp: '+244926719714', instagram: 'Gilberto_Aqui_Tem', facebook: '', email: '', address: 'Luanda, Angola', hours: '' }

export const getPublicSettings = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('store_settings').select('key,value').eq('is_public', true)
  const map = new Map((data ?? []).map((r) => [r.key, r.value]))
  return {
    store: { ...DEFAULT_STORE, ...((map.get('store') as Partial<StoreSettings>) ?? {}) },
    checkout: { delivery_fee: 0, payment_methods: [], guest_checkout: true, ...((map.get('checkout') as Partial<CheckoutSettings>) ?? {}) } as CheckoutSettings,
    loyalty: { enabled: false, points_per_1000: 0, kz_per_point: 0, min_redeem_points: 0, silver_threshold: 0, gold_threshold: 0, vip_threshold: 0, birthday_coupon_percent: 0, ...((map.get('loyalty') as Partial<LoyaltySettings>) ?? {}) } as LoyaltySettings,
    wheel: { enabled: false, cooldown_hours: 24, requires_purchase: false, ...((map.get('wheel') as Partial<WheelSettings>) ?? {}) } as WheelSettings,
  }
})

export const getCategories = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
  return data ?? []
})

export const getBrands = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('brands').select('*').eq('is_active', true).order('sort_order')
  return data ?? []
})

export type ProductFilters = {
  q?: string
  category?: string
  brand?: string
  condition?: string
  min?: number
  max?: number
  sort?: 'recent' | 'price_asc' | 'price_desc' | 'rating' | 'popular'
  featured?: boolean
  promo?: boolean
  inStock?: boolean
  page?: number
  perPage?: number
}

export async function getProducts(f: ProductFilters = {}) {
  const supabase = createClient()
  const perPage = f.perPage ?? 24
  const page = Math.max(1, f.page ?? 1)
  let q = supabase.from('storefront_products').select('*', { count: 'exact' })
  if (f.q) {
    const term = f.q.replace(/[%_,()]/g, ' ').trim()
    q = q.or(`name.ilike.%${term}%,model.ilike.%${term}%,brand_name.ilike.%${term}%,sku.ilike.%${term}%,description.ilike.%${term}%`)
  }
  if (f.category) q = q.eq('category_slug', f.category)
  if (f.brand) q = q.eq('brand_slug', f.brand)
  if (f.condition) q = q.eq('condition', f.condition as Database['public']['Enums']['product_condition'])
  if (f.min != null) q = q.gte('price', f.min)
  if (f.max != null) q = q.lte('price', f.max)
  if (f.featured) q = q.eq('is_featured', true)
  if (f.promo) q = q.eq('is_promo', true)
  if (f.inStock) q = q.gt('stock_total', 0)
  switch (f.sort) {
    case 'price_asc': q = q.order('price', { ascending: true }); break
    case 'price_desc': q = q.order('price', { ascending: false }); break
    case 'rating': q = q.order('rating_avg', { ascending: false }).order('rating_count', { ascending: false }); break
    case 'popular': q = q.order('sold_count', { ascending: false }); break
    default: q = q.order('created_at', { ascending: false })
  }
  q = q.range((page - 1) * perPage, page * perPage - 1)
  const { data, count } = await q
  return { products: (data ?? []) as StorefrontProduct[], total: count ?? 0, page, perPage }
}

export async function getProductBySlug(slug: string) {
  const supabase = createClient()
  const { data: product } = await supabase.from('storefront_products').select('*').eq('slug', slug).maybeSingle()
  if (!product) return null
  const [{ data: images }, { data: reviews }, { data: related }] = await Promise.all([
    supabase.from('product_images').select('*').eq('product_id', product.id!).order('is_primary', { ascending: false }).order('sort_order'),
    supabase.from('reviews').select('*').eq('product_id', product.id!).eq('status', 'aprovada').order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(20),
    supabase.from('storefront_products').select('*').eq('category_id', product.category_id!).neq('id', product.id!).gt('stock_total', 0).limit(4),
  ])
  return { product: product as StorefrontProduct, images: images ?? [], reviews: reviews ?? [], related: (related ?? []) as StorefrontProduct[] }
}

export const getBanners = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order')
  return data ?? []
})


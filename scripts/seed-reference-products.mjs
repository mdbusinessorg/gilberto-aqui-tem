// GAT_SERVICE_KEY=<service-role> node scripts/seed-reference-products.mjs --apply
// Product photographs: https://savemart-vinovatheme.myshopify.com/
const url = 'https://hfwshixqfhrnxwtixoqr.supabase.co/rest/v1/'
const key = process.env.GAT_SERVICE_KEY
if (!key || !process.argv.includes('--apply')) {
  console.error('Define GAT_SERVICE_KEY e passa --apply para adicionar os produtos de demonstração.')
  process.exit(1)
}

async function request(path, method = 'GET', body) {
  const response = await fetch(url + path, {
    method,
    headers: {
      apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw new Error(`${path}: ${response.status} ${await response.text()}`)
  return response.json()
}

const catalog = [
  { name: 'Apple Watch Series 3', slug: 'apple-watch-series-3', image: 'apple-watch', brand: 'apple', category: 'apple-watch', price: 155000 },
  { name: 'iPhone X 64GB', slug: 'iphone-x-64gb', image: 'iphone-x', brand: 'apple', category: 'iphone', price: 245000 },
  { name: 'iPad 9.7" 32GB', slug: 'ipad-97-32gb', image: 'ipad', brand: 'apple', category: 'tablets', price: 195000 },
  { name: 'Vivo V9 64GB', slug: 'vivo-v9-64gb', image: 'vivo-v9', brand: 'vivo', category: 'android', price: 110000, promo: 95000 },
  { name: 'Samsung Galaxy Note8', slug: 'samsung-galaxy-note8', image: 'galaxy-note8', brand: 'samsung', category: 'samsung', price: 175000 },
  { name: 'HTC 10 32GB', slug: 'htc-10-32gb', image: 'htc-10', brand: 'htc', category: 'android', price: 79000 },
  { name: 'Harman Kardon Aura Studio', slug: 'harman-kardon-aura-studio', image: 'harman-aura', brand: 'harman-kardon', category: 'audio', price: 185000 },
  { name: 'Auscultadores Beats', slug: 'auscultadores-beats', image: 'beats-headphones', brand: 'beats', category: 'audio', price: 125000, promo: 110000 },
  { name: 'Coluna Sony Bluetooth', slug: 'coluna-sony-bluetooth', image: 'sony-speaker', brand: 'sony', category: 'audio', price: 55000 },
  { name: 'Coluna Philips Bluetooth', slug: 'coluna-philips-bluetooth', image: 'philips-speaker', brand: 'philips', category: 'audio', price: 39000 },
  { name: 'Monitor de áudio Yamaha', slug: 'monitor-audio-yamaha', image: 'yamaha-speaker', brand: 'yamaha', category: 'audio', price: 165000 },
  { name: 'Dell Studio Hybrid', slug: 'dell-studio-hybrid', image: 'dell-hybrid', brand: 'dell', category: 'outros', price: 195000 },
  { name: 'Colunas Logitech', slug: 'colunas-logitech', image: 'logitech-speakers', brand: 'logitech', category: 'audio', price: 45000 },
  { name: 'DJI Mavic Pro', slug: 'dji-mavic-pro', image: 'dji-mavic', brand: 'dji', category: 'outros', price: 650000 },
]

await request('categories?on_conflict=slug', 'POST', [
  { name: 'Áudio & Colunas', slug: 'audio', sort_order: 11 },
  { name: 'Tablets', slug: 'tablets', sort_order: 12 },
])
await request('brands?on_conflict=slug', 'POST', [
  ['Vivo', 'vivo'], ['HTC', 'htc'], ['Harman Kardon', 'harman-kardon'],
  ['Beats', 'beats'], ['Philips', 'philips'], ['Yamaha', 'yamaha'],
  ['Logitech', 'logitech'], ['DJI', 'dji'],
].map(([name, slug]) => ({ name, slug })))
const [categories, brands, locations] = await Promise.all([
  request('categories?select=id,slug'), request('brands?select=id,slug'),
  request('inventory_locations?slug=eq.loja-principal&select=id'),
])
if (!locations[0]) throw new Error('Localização loja-principal em falta')
const createdAt = Date.now()
await request('products?on_conflict=sku', 'POST', catalog.map((p, index) => ({
  name: p.name, slug: p.slug, sku: `GAT-REF-${p.slug.toUpperCase()}`,
  category_id: categories.find(c => c.slug === p.category)?.id,
  brand_id: brands.find(b => b.slug === p.brand)?.id,
  price: p.price, promo_price: p.promo ?? null, is_promo: Boolean(p.promo),
  is_featured: true, condition: 'usado',
  description: 'Produto de demonstração para apresentação da loja. Preço e disponibilidade ilustrativos; confirma os detalhes com a equipa antes de comprar.',
  internal_notes: 'Catálogo de demonstração da referência visual. Validar preço, estado e disponibilidade antes de vendas reais.',
  created_at: new Date(createdAt - index * 1000).toISOString(),
})))
const products = await request('products?sku=like.GAT-REF-*&select=id,slug')
const ids = products.map(p => p.id).join(',')
const images = await request(`product_images?product_id=in.(${ids})&select=product_id`)
const missingImages = products.filter(p => !images.some(image => image.product_id === p.id))
if (missingImages.length) {
  await request('product_images', 'POST', missingImages.map(p => {
    const item = catalog.find(item => item.slug === p.slug)
    if (!item) throw new Error(`Produto inesperado: ${p.slug}`)
    return { product_id: p.id, url: `/products/${item.image}.webp`, alt: item.name, is_primary: true, sort_order: 0 }
  }))
}
await request('inventory?on_conflict=product_id,location_id', 'POST', products.map(p => ({
  product_id: p.id, location_id: locations[0].id, quantity: 5,
})))
console.log(`${products.length} produtos de referência disponíveis. Produtos e stock existentes preservados.`)

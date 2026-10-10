export const CAT_PRIORITY = ['iphone', 'samsung', 'tablets', 'laptops', 'monitores', 'informatica', 'audio', 'acessorios', 'playstation', 'airpods', 'apple-watch', 'android', 'macbook', 'outros']

export const CAT_IMG: Record<string, string> = {
  iphone: 'https://hfwshixqfhrnxwtixoqr.supabase.co/storage/v1/object/public/products/hero/web-hero-iphone.png',
  samsung: '/categorias/samsung.webp',
  tablets: '/categorias/tablets.webp',
  laptops: '/categorias/computadores.webp',
  monitores: '/categorias/monitores.webp',
  informatica: '/categorias/informatica.webp',
  acessorios: '/categorias/acessorios.webp',
}

export const CAT_HREF: Record<string, string> = {
  laptops: '/loja?categorias=laptops,macbook',
}

export const CAT_NAME: Record<string, string> = {
  laptops: 'Computadores',
}

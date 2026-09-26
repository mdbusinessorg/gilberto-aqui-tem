import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/conta', '/checkout', '/carrinho'] }],
    sitemap: 'https://gilbertoaquitem.com/sitemap.xml',
  }
}

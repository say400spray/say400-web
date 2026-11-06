import type { MetadataRoute } from 'next'

import { absoluteUrl, indexable } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/** While the site is a password-protected preview nothing is crawled. */
export default function robots(): MetadataRoute.Robots {
  if (!indexable()) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/account', '/checkout', '/payment', '/login', '/register'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}

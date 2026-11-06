import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { getSampleCampaign } from '@/lib/samples'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/** Public pages only: home, the products on sale, the free sample page while it runs, legal pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const [{ docs: products }, { docs: pages }, samples] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { active: { equals: true } },
      limit: 100,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'pages',
      limit: 100,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    getSampleCampaign(payload),
  ])

  const latest = [...products, ...pages].reduce(
    (max, d) => (d.updatedAt > max ? d.updatedAt : max),
    new Date(0).toISOString(),
  )

  return [
    { url: absoluteUrl('/'), lastModified: latest, changeFrequency: 'weekly', priority: 1 },
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...(samples && samples.remaining > 0
      ? [{ url: absoluteUrl('/free-sample'), changeFrequency: 'daily' as const, priority: 0.7 }]
      : []),
    ...pages.map((p) => ({
      url: absoluteUrl(`/legal/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]
}

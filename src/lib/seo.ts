import type { Metadata } from 'next'

import { previewPassword } from './previewAccess'
import { siteUrl } from './site'

export const SITE_NAME = 'Say400'
export const DEFAULT_TITLE = 'Say400 Delay Spray for Men | Last Longer in Bed, UK & EU'
export const DEFAULT_DESCRIPTION =
  'Say400 delay spray for men helps you last longer in bed. Botanical formula, 2–3 sprays, works in 2–5 minutes. Five strengths, plain packaging, UK & EU delivery. 18+.'

/** Search engines may index the site only once it is public (no preview password). */
export const indexable = () => !previewPassword()

/** Absolute URL for a path on this site. */
export const absoluteUrl = (path = '/') => `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`

/** Pages that must never appear in search results (accounts, checkout, payment). */
export const privatePage = (title: string): Metadata => ({
  title,
  robots: { index: false, follow: false },
})

/** JSON-LD script tag content; "<" is escaped so the data can never close the script tag. */
export const jsonLd = (data: unknown) => ({
  __html: JSON.stringify(data).replace(/</g, '\\u003c'),
})

/** Title, description, canonical link and the matching link-preview (Open Graph) texts. */
export const pageMeta = (title: string, description: string, path: string): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_GB',
    title: `${title} | ${SITE_NAME}`,
    description,
    url: path,
    images: [{ url: '/brand/og-image.jpg', alt: 'Say400 Men Spray' }],
  },
  twitter: { card: 'summary_large_image', title: `${title} | ${SITE_NAME}`, description },
})

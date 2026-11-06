import type { Metadata } from 'next'

import { previewPassword } from './previewAccess'
import { siteUrl } from './site'

export const SITE_NAME = 'Say400'
export const DEFAULT_TITLE = 'Say400 Men Spray | Discreet Delay Spray, UK & EU Delivery'
export const DEFAULT_DESCRIPTION =
  'Say400 Men Spray: a discreet, pocket-size intimate delay spray for men in five strengths. Plain packaging, tracked delivery from the UK to the UK and the EU. Adults 18+.'

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

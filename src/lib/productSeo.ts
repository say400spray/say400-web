import type { Media, Product } from '../payload-types'
import type { Currency } from './countries'
import { priceFor } from './pricing'
import { absoluteUrl, SITE_NAME } from './seo'
import { activeVariants, mediaPath, sizeOptions, variantOptions } from './variants'

/** Absolute image URLs for a product: its own photos, else the front of each box. */
export function productImages(product: Product): string[] {
  const own = (product.images ?? [])
    .filter((m): m is Media => typeof m === 'object' && Boolean(m?.url))
    .map((m) => absoluteUrl(mediaPath(m.url!)))
  if (own.length) return own
  return variantOptions(product)
    .map((v) => v.front?.url)
    .filter((url): url is string => Boolean(url))
    .map((url) => absoluteUrl(url))
}

/** Every price a customer can pay for the product in one currency (sizes, else variants). */
function prices(product: Product, currency: Currency): number[] {
  const sizes = sizeOptions(product)
  const list = sizes.length
    ? sizes.map((s) => priceFor(product, currency, null, s))
    : activeVariants(product).length
      ? activeVariants(product).map((v) => priceFor(product, currency, v))
      : [priceFor(product, currency)]
  return list.filter((p): p is number => p != null)
}

/**
 * schema.org Product for Google's product results. The rating is only included when there are
 * genuine reviews (sample reviews never count, see ratingSummary).
 */
export function productJsonLd(product: Product, rating: { average: number; count: number }) {
  const url = absoluteUrl(`/products/${product.slug}`)
  const offers = (['GBP', 'EUR'] as const)
    .map((currency) => {
      const list = prices(product, currency)
      if (!list.length) return null
      return {
        '@type': 'AggregateOffer',
        priceCurrency: currency,
        lowPrice: Math.min(...list).toFixed(2),
        highPrice: Math.max(...list).toFixed(2),
        offerCount: list.length,
        availability: 'https://schema.org/InStock',
        url,
        seller: { '@type': 'Organization', name: SITE_NAME },
      }
    })
    .filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || undefined,
    brand: { '@type': 'Brand', name: SITE_NAME },
    image: productImages(product),
    url,
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 18 },
    offers,
    ...(rating.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.average.toFixed(1),
        reviewCount: rating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

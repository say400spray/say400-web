import type { Media, Product } from '../payload-types'

export type ProductVariant = NonNullable<Product['variants']>[number]

type Picture = { url: string; alt: string }

/** What the browser needs to show and pick a variant. */
export type VariantOption = {
  id: string
  name: string
  strength?: string | null
  level?: string | null
  description?: string | null
  color: string
  price?: number | null
  priceEUR?: number | null
  front: Picture | null
  back: Picture | null
}

/**
 * Files served by this site (/api/...) carry SITE_URL's host; a path works on localhost and on the
 * shared preview alike. Files on Vercel Blob keep their full CDN address.
 */
export const mediaPath = (url: string) => url.replace(/^https?:\/\/[^/]+(?=\/api\/)/, '')

const picture = (media: number | Media | null | undefined): Picture | null =>
  media && typeof media === 'object' && media.url
    ? { url: mediaPath(media.url), alt: media.alt }
    : null

/** Variants a customer can buy, in the order set in the admin. */
export const activeVariants = (product: Pick<Product, 'variants'>) =>
  (product.variants ?? []).filter(
    (v): v is ProductVariant & { id: string } => Boolean(v.id) && v.active !== false,
  )

/** "Gold · 50 mg" */
export const variantLabel = (variant: Pick<ProductVariant, 'name' | 'strength'>) =>
  [variant.name, variant.strength].filter(Boolean).join(' · ')

/**
 * The variant to sell: the requested one, or the first when none was asked for.
 * Undefined when the product has variants but the requested one is gone or inactive.
 */
export function pickVariant(product: Pick<Product, 'variants'>, id?: string | null) {
  const variants = activeVariants(product)
  if (!variants.length) return null
  return id ? variants.find((v) => v.id === id) : variants[0]
}

export const toVariantOption = (variant: ProductVariant & { id: string }): VariantOption => ({
  id: variant.id,
  name: variant.name,
  strength: variant.strength,
  level: variant.level,
  description: variant.description,
  color: variant.color,
  price: variant.price,
  priceEUR: variant.priceEUR,
  front: picture(variant.front),
  back: picture(variant.back),
})

export const variantOptions = (product: Pick<Product, 'variants'>) =>
  activeVariants(product).map(toVariantOption)

/** What the browser needs to show and pick a size. */
export type SizeOption = {
  id: string
  label: string
  price: number
  priceEUR?: number | null
  firstOrderDeal: boolean
}

export const sizeOptions = (product: Pick<Product, 'sizes'>): SizeOption[] =>
  (product.sizes ?? [])
    .filter((s): s is typeof s & { id: string } => Boolean(s.id))
    .map((s) => ({
      id: s.id,
      label: s.label,
      price: s.price,
      priceEUR: s.priceEUR,
      firstOrderDeal: Boolean(s.firstOrderDeal),
    }))

/**
 * The size to sell: the requested one, or the first when none was asked for.
 * Undefined when the product has sizes but the requested one is gone.
 */
export function pickSize(product: Pick<Product, 'sizes'>, id?: string | null) {
  const sizes = product.sizes ?? []
  if (!sizes.length) return null
  return id ? sizes.find((s) => s.id === id) : sizes[0]
}

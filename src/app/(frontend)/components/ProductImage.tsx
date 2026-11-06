import type { Product } from '@/payload-types'
import { mediaPath } from '@/lib/variants'
import { Bottle } from './Bottle'

/** First product image, or the illustrated bottle (box photos live in the product gallery). */
export function ProductImage({ product, className }: { product: Product; className?: string }) {
  const image = product.images?.find((img) => typeof img === 'object')
  if (image && typeof image === 'object' && image.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={image.alt} className={className} src={mediaPath(image.url)} />
  }
  return <Bottle className={className} label={product.name} />
}

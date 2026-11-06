import type { Product } from '../payload-types'
import type { Currency } from './countries'

type Prices = { price?: number | null; priceEUR?: number | null }
type SizeLike = Prices & { id?: string | null; firstOrderDeal?: boolean | null }

const inCurrency = (prices: Prices, currency: Currency) => {
  const price = currency === 'GBP' ? prices.price : prices.priceEUR
  return typeof price === 'number' ? price : null
}

/**
 * Regular price in the given currency, or null when no price is set for it.
 * A size's price wins; otherwise a variant's own price, when filled in, replaces the product price.
 */
export function priceFor(
  product: Pick<Product, 'price' | 'priceEUR'>,
  currency: Currency,
  variant?: Prices | null,
  size?: Prices | null,
): number | null {
  if (size) return inCurrency(size, currency)
  return (variant && inCurrency(variant, currency)) ?? inCurrency(product, currency)
}

/**
 * First-order offer price for a size marked "first-order offer": the price of the product's first
 * (smallest) size. Null when the size has no offer or the first size has no price in this currency.
 */
export function firstOrderPriceFor(
  product: { sizes?: SizeLike[] | null },
  currency: Currency,
  size: SizeLike | null | undefined,
): number | null {
  const base = product.sizes?.[0]
  if (!size?.firstOrderDeal || !base || base.id === size.id) return null
  const offer = inCurrency(base, currency)
  const regular = inCurrency(size, currency)
  return offer != null && regular != null && offer < regular ? offer : null
}

export const roundMoney = (amount: number) => Math.round(amount * 100) / 100

import type { Currency } from '@/lib/countries'
import { formatMoney } from '@/lib/orderStatus'
import { priceFor } from '@/lib/pricing'
import type { Product } from '@/payload-types'

/**
 * Shows the price in the visitor's currency when we know their country,
 * otherwise the UK price with the EU price underneath.
 */
export function Price({
  product,
  currency,
  className,
}: {
  product: Pick<Product, 'price' | 'priceEUR'>
  currency?: Currency
  className?: string
}) {
  if (currency) {
    const price = priceFor(product, currency)
    return (
      <p className={className}>
        {price == null ? 'Not available in your country' : formatMoney(price, currency)}
      </p>
    )
  }
  return (
    <div className="price-pair">
      <p className={className}>{formatMoney(product.price, 'GBP')}</p>
      {product.priceEUR != null && (
        <p className="price-alt">{formatMoney(product.priceEUR, 'EUR')} in the EU</p>
      )}
    </div>
  )
}

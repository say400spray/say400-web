import type { BasePayload } from 'payload'

import type { Customer, Product } from '../payload-types'
import type { Currency } from './countries'
import { offerFor } from './offer'
import { getShippingFee } from './payload'
import { firstOrderPriceFor, priceFor, roundMoney } from './pricing'
import { type ProductVariant, variantLabel } from './variants'

type Size = NonNullable<Product['sizes']>[number]

/**
 * Prices one checkout line exactly as the order will be saved, shared by the checkout page
 * and the order action so what the customer sees is what they pay.
 * Null when the product has no price in this currency.
 */
export async function quoteOrder(
  payload: BasePayload,
  {
    product,
    variant,
    size,
    quantity,
    currency,
    customer,
  }: {
    product: Product
    variant: ProductVariant | null
    size: Size | null
    quantity: number
    currency: Currency
    customer: Customer
  },
) {
  const unitPrice = priceFor(product, currency, variant, size)
  if (unitPrice == null) return null

  // "Gold · 50 mg · 12 ml": exactly which box to pack
  const option = [variant && variantLabel(variant), size?.label].filter(Boolean).join(' · ')
  const item = {
    product: product.id,
    name: option ? `${product.name} — ${option}` : product.name,
    variant: option || undefined,
  }

  const offer = await offerFor(payload, customer)
  // size offer: one unit at the first size's price, on its own line so the saving stays visible
  const offerPrice = offer?.kind === 'size' ? firstOrderPriceFor(product, currency, size) : null
  const items =
    offerPrice == null
      ? [{ ...item, unitPrice, quantity }]
      : [
          {
            ...item,
            name: `${item.name} (${offer!.badge.toLowerCase()})`,
            unitPrice: offerPrice,
            quantity: 1,
          },
          ...(quantity > 1 ? [{ ...item, unitPrice, quantity: quantity - 1 }] : []),
        ]

  const subtotal = roundMoney(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0))
  // percentage offer: taken off the products, not the shipping
  const discount = offer?.kind === 'percent' ? roundMoney((subtotal * offer.percent) / 100) : 0
  const shippingFee = await getShippingFee(roundMoney(subtotal - discount), currency)

  return {
    offer,
    unitPrice,
    offerPrice,
    option,
    items,
    subtotal,
    discount,
    shippingFee,
    total: roundMoney(subtotal - discount + shippingFee),
  }
}

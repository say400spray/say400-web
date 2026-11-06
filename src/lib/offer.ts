import type { BasePayload } from 'payload'

import type { Customer } from '../payload-types'

export type FirstOrderOffer = {
  /** "percent": a percentage off the first order; "size": a bigger size for the first size's price */
  kind: 'percent' | 'size'
  percent: number
  title: string
  badge: string
  text: string
}

const DEFAULTS = {
  percent: {
    title: 'First order? Take {percent}% off.',
    badge: '{percent}% off your first order',
    text: 'Join with your email and the discount is applied automatically at checkout.',
  },
  size: {
    title: '12 ml for the price of 6 ml',
    badge: 'First-order offer',
    text: 'Double the spray, same price. Choose 12 ml on your first order and pay the 6 ml price. Applied automatically at checkout.',
  },
}

/** The running first-order offer with its texts, or null when switched off in Shop settings. */
export async function getFirstOrderOffer(payload: BasePayload): Promise<FirstOrderOffer | null> {
  const { firstOrderOffer: offer } = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  if (offer?.enabled === false) return null
  const kind = offer?.kind === 'size' ? 'size' : 'percent'
  const percent = Math.min(Math.max(offer?.percent ?? 20, 1), 90)
  const fill = (text: string) => text.replaceAll('{percent}', String(percent))
  return {
    kind,
    percent,
    title: fill(offer?.title || DEFAULTS[kind].title),
    badge: fill(offer?.badge || DEFAULTS[kind].badge),
    text: fill(offer?.text || DEFAULTS[kind].text),
  }
}

/** Orders that count as "already bought": anything that was paid at some point. */
const BOUGHT = ['paid', 'processing', 'shipped', 'refunded'] as const

/** Visitors and customers who never completed a paid order can use the offer. */
export async function isFirstOrder(
  payload: BasePayload,
  customer: Customer | null,
): Promise<boolean> {
  if (!customer) return true
  const { totalDocs } = await payload.count({
    collection: 'orders',
    where: { customer: { equals: customer.id }, status: { in: [...BOUGHT] } },
  })
  return totalDocs === 0
}

/** The offer this visitor can use right now, or null. */
export async function offerFor(payload: BasePayload, customer: Customer | null) {
  const offer = await getFirstOrderOffer(payload)
  return offer && (await isFirstOrder(payload, customer)) ? offer : null
}

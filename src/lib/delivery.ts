import type { Payload } from 'payload'

import { cached } from './cms'

/**
 * True while delivery costs nothing to both the UK and the EU (fees in the admin set to 0).
 * Pages use it to say "free delivery", so the promise disappears by itself if a fee is added.
 */
export async function hasFreeDelivery(payload: Payload): Promise<boolean> {
  const settings = await cached(['shop-settings'], () =>
    payload.findGlobal({ slug: 'shop-settings' }),
  )
  return !settings.shippingFee && !settings.euShippingFee
}

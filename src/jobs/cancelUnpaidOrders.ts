import type { TaskConfig } from 'payload'

import { cancelUnpaidOrders } from '../lib/payments'

/** Runs every 30 minutes and cancels orders left unpaid (abandoned checkouts). */
export const cancelUnpaidOrdersTask: TaskConfig<{ input: object; output: { cancelled: number } }> = {
  slug: 'cancelUnpaidOrders',
  schedule: [{ cron: '0 */30 * * * *', queue: 'maintenance' }],
  retries: 2,
  handler: async ({ req }) => {
    const cancelled = await cancelUnpaidOrders(req.payload)
    if (cancelled) req.payload.logger.info(`Cancelled ${cancelled} unpaid order(s)`)
    return { output: { cancelled } }
  },
}

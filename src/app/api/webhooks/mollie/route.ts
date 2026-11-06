import config from '@payload-config'
import { getPayload } from 'payload'

import { syncPayment } from '@/lib/payments'

/**
 * Mollie posts only `id=tr_xxx`; we fetch the payment from Mollie ourselves,
 * so a forged request cannot mark an order as paid.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const paymentId = form?.get('id')
  if (typeof paymentId !== 'string' || !paymentId.startsWith('tr_')) {
    return new Response('Bad request', { status: 400 })
  }

  const payload = await getPayload({ config, cron: true })
  try {
    await syncPayment(payload, paymentId)
  } catch (err) {
    // unknown payment ids are acknowledged so Mollie stops retrying (and nothing is leaked)
    if ((err as { statusCode?: number }).statusCode === 404) return new Response('OK', { status: 200 })
    payload.logger.error({ err, msg: `Mollie webhook failed for ${paymentId}` })
    // a non-2xx response makes Mollie retry later
    return new Response('Error', { status: 500 })
  }
  return new Response('OK', { status: 200 })
}

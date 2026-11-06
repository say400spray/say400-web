import { randomBytes } from 'crypto'
import type { Payload } from 'payload'

import type { Order } from '../../payload-types'
import { isPublicSiteUrl, siteUrl } from '../site'
import { mollieProvider } from './mollie'
import type { PaymentProvider } from './types'

export const paymentProvider: PaymentProvider = mollieProvider

/** Orders still unpaid after this long are cancelled automatically. */
export const UNPAID_ORDER_TTL_HOURS = 48

const UNPAID_STATUSES: Order['status'][] = ['pending_payment', 'cancelled']

function addNote(order: Order, note: string): string {
  const line = `[${new Date().toISOString().slice(0, 16).replace('T', ' ')}] ${note}`
  return order.notes ? `${order.notes}\n${line}` : line
}

/** Creates a payment for an order awaiting payment and returns the provider checkout URL. */
export async function startPaymentForOrder(payload: Payload, order: Order): Promise<string> {
  if (order.status !== 'pending_payment') {
    throw new Error(`Order ${order.orderNumber} is not awaiting payment`)
  }
  if (!order.accessToken) {
    order = await payload.update({
      collection: 'orders',
      id: order.id,
      data: { accessToken: randomBytes(24).toString('hex') },
    })
  }

  // a retry: close the previous attempt so the customer cannot pay twice
  if (order.payment?.paymentId) {
    await paymentProvider.cancelPayment(order.payment.paymentId).catch((err) => {
      payload.logger.warn({ err, msg: `Could not cancel previous payment ${order.payment?.paymentId}` })
    })
  }

  const { paymentId, checkoutUrl } = await paymentProvider.createPayment({
    orderId: order.id,
    orderNumber: order.orderNumber!,
    amount: order.total,
    currency: order.currency === 'EUR' ? 'EUR' : 'GBP',
    description: `Order ${order.orderNumber}`,
    customerEmail: order.email,
    redirectUrl: `${siteUrl()}/payment/return?order=${encodeURIComponent(order.orderNumber!)}&token=${order.accessToken}`,
    webhookUrl: isPublicSiteUrl() ? `${siteUrl()}/api/webhooks/${paymentProvider.name}` : undefined,
  })

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      payment: {
        provider: paymentProvider.name,
        paymentId,
        providerStatus: 'open',
        attemptIds: [...attemptIds(order), paymentId].join(','),
      },
    },
  })
  return checkoutUrl
}

function attemptIds(order: Order): string[] {
  const ids = (order.payment?.attemptIds ?? '').split(',').filter(Boolean)
  // orders created before attempts were tracked only know their current payment
  if (order.payment?.paymentId && !ids.includes(order.payment.paymentId)) ids.push(order.payment.paymentId)
  return ids
}

/**
 * Syncs every payment attempt of an order, older ones first. The customer may have paid
 * an earlier attempt (e.g. in another tab) after starting a new one.
 */
export async function syncOrderPayments(payload: Payload, order: Order): Promise<Order> {
  let current = order
  for (const id of attemptIds(order)) {
    current = (await syncPayment(payload, id)) ?? current
  }
  return current
}

/**
 * Asks the provider for the real payment status and updates the order.
 * Used by the webhook, the return page and the cleanup job; the redirect itself is never trusted.
 *
 * - paid → order "paid" (also revives an auto-cancelled order paid late)
 * - paid, but the order was already paid by another attempt → refunded automatically
 * - failed / canceled / expired / open → order stays "awaiting payment" so the customer can retry
 * - updates about an older attempt never overwrite the current one
 */
export async function syncPayment(payload: Payload, paymentId: string): Promise<Order | null> {
  const info = await paymentProvider.getPayment(paymentId)
  if (!info.orderNumber) return null

  const { docs } = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: info.orderNumber } },
    limit: 1,
  })
  const order = docs[0]
  if (!order) return null

  const isCurrentAttempt = !order.payment?.paymentId || order.payment.paymentId === info.paymentId

  if (info.state === 'paid') {
    if (UNPAID_STATUSES.includes(order.status)) {
      if (Math.abs(info.amount - order.total) > 0.001) {
        payload.logger.error(
          `Payment ${paymentId} amount ${info.amount} does not match order ${order.orderNumber} total ${order.total}`,
        )
        return payload.update({
          collection: 'orders',
          id: order.id,
          data: { notes: addNote(order, `Payment ${paymentId} amount ${info.amount} does not match the order total. Check manually.`) },
        })
      }
      return payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: 'paid',
          payment: {
            provider: paymentProvider.name,
            paymentId: info.paymentId,
            providerStatus: info.providerStatus,
            paidAt: info.paidAt,
          },
          notes:
            order.status === 'cancelled'
              ? addNote(order, 'Paid after automatic cancellation: order reopened as paid.')
              : order.notes,
        },
      })
    }

    if (!isCurrentAttempt) {
      // the order was already paid with another attempt: give this money back
      const note = `Duplicate payment ${info.paymentId} refunded automatically.`
      if (order.notes?.includes(note)) return order
      await paymentProvider.refundPayment(info, `Duplicate payment for order ${order.orderNumber}`)
      payload.logger.warn(`Refunded duplicate payment ${info.paymentId} for order ${order.orderNumber}`)
      return payload.update({ collection: 'orders', id: order.id, data: { notes: addNote(order, note) } })
    }
    return order
  }

  // anything else only matters for the attempt the order is currently waiting on
  if (!isCurrentAttempt) return order

  const status: Order['status'] = info.state === 'refunded' ? 'refunded' : order.status
  if (status === order.status && order.payment?.providerStatus === info.providerStatus) return order

  return payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      status,
      payment: {
        provider: paymentProvider.name,
        paymentId: info.paymentId,
        providerStatus: info.providerStatus,
        paidAt: order.payment?.paidAt,
      },
    },
  })
}

/**
 * Cancels orders that are still unpaid after UNPAID_ORDER_TTL_HOURS.
 * Each one is checked with the provider first, so an order that was in fact paid is never cancelled.
 */
export async function cancelUnpaidOrders(payload: Payload): Promise<number> {
  const cutoff = new Date(Date.now() - UNPAID_ORDER_TTL_HOURS * 60 * 60 * 1000).toISOString()
  const { docs } = await payload.find({
    collection: 'orders',
    where: { status: { equals: 'pending_payment' }, createdAt: { less_than: cutoff } },
    limit: 100,
    depth: 0,
  })

  let cancelled = 0
  for (let order of docs) {
    order = await syncOrderPayments(payload, order)
    if (order.status !== 'pending_payment') continue
    // the bank is still processing: money may still arrive, so leave it for the next run
    if (['pending', 'authorized'].includes(order.payment?.providerStatus ?? '')) continue
    for (const id of attemptIds(order)) {
      await paymentProvider.cancelPayment(id).catch(() => undefined)
    }
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        status: 'cancelled',
        notes: addNote(order, `Cancelled automatically: not paid within ${UNPAID_ORDER_TTL_HOURS} hours.`),
      },
    })
    cancelled++
  }
  return cancelled
}

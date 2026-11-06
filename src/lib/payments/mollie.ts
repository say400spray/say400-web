// named import: the default export breaks under plain Node (scripts, scheduled jobs)
import { createMollieClient, type MollieClient, PaymentStatus } from '@mollie/api-client'

import type { PaymentInfo, PaymentProvider, PaymentState } from './types'

let client: MollieClient | null = null

function mollie(): MollieClient {
  if (!process.env.MOLLIE_API_KEY) throw new Error('MOLLIE_API_KEY is not set')
  client ??= createMollieClient({ apiKey: process.env.MOLLIE_API_KEY })
  return client
}

function toState(status: PaymentStatus, refunded: boolean): PaymentState {
  if (refunded) return 'refunded'
  switch (status) {
    case PaymentStatus.paid:
      return 'paid'
    case PaymentStatus.canceled:
    case PaymentStatus.expired:
    case PaymentStatus.failed:
      return 'failed'
    default:
      return 'open' // open, pending, authorized
  }
}

export const mollieProvider: PaymentProvider = {
  name: 'mollie',

  async createPayment(input) {
    const payment = await mollie().payments.create({
      amount: { currency: input.currency, value: input.amount.toFixed(2) },
      description: input.description,
      redirectUrl: input.redirectUrl,
      webhookUrl: input.webhookUrl,
      billingEmail: input.customerEmail,
      metadata: { orderId: String(input.orderId), orderNumber: input.orderNumber },
    })
    const checkoutUrl = payment.getCheckoutUrl()
    if (!checkoutUrl) throw new Error(`Mollie payment ${payment.id} has no checkout URL`)
    return { paymentId: payment.id, checkoutUrl }
  },

  async getPayment(paymentId): Promise<PaymentInfo> {
    const payment = await mollie().payments.get(paymentId)
    const refunded = Number(payment.amountRefunded?.value ?? 0) >= Number(payment.amount.value)
    const metadata = (payment.metadata ?? {}) as { orderNumber?: string }
    return {
      paymentId: payment.id,
      state: toState(payment.status, refunded),
      providerStatus: refunded ? 'refunded' : payment.status,
      amount: Number(payment.amount.value),
      currency: payment.amount.currency,
      amountRefunded: Number(payment.amountRefunded?.value ?? 0),
      orderNumber: metadata.orderNumber,
      paidAt: payment.paidAt ?? undefined,
    }
  },

  async cancelPayment(paymentId) {
    const payment = await mollie().payments.get(paymentId)
    if (payment.isCancelable) await mollie().payments.cancel(paymentId)
  },

  async refundPayment(payment, description) {
    const remaining = payment.amount - payment.amountRefunded
    if (remaining <= 0) return
    await mollie().paymentRefunds.create({
      paymentId: payment.paymentId,
      amount: { currency: payment.currency, value: remaining.toFixed(2) },
      description,
    })
  },
}

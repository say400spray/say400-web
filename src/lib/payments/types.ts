/** Provider-neutral payment status, mapped from each provider's own statuses. */
export type PaymentState = 'open' | 'paid' | 'failed' | 'refunded'

export interface CreatePaymentInput {
  orderId: number | string
  orderNumber: string
  amount: number // e.g. 24.99
  currency: 'GBP' | 'EUR'
  description: string
  customerEmail: string
  redirectUrl: string
  webhookUrl?: string
}

export interface CreatedPayment {
  paymentId: string
  checkoutUrl: string
}

export interface PaymentInfo {
  paymentId: string
  state: PaymentState
  providerStatus: string
  amount: number
  currency: string
  amountRefunded: number
  orderNumber?: string
  paidAt?: string
}

/** Swap the implementation (Mollie, Stripe, …) without touching orders or pages. */
export interface PaymentProvider {
  name: string
  createPayment(input: CreatePaymentInput): Promise<CreatedPayment>
  getPayment(paymentId: string): Promise<PaymentInfo>
  /** Cancels a payment that can still be cancelled; does nothing otherwise. */
  cancelPayment(paymentId: string): Promise<void>
  refundPayment(payment: PaymentInfo, description: string): Promise<void>
}

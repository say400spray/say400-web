import Link from 'next/link'
import { notFound } from 'next/navigation'

import { timingSafeEqual } from 'crypto'

import { getCurrentCustomer, getPayloadClient } from '@/lib/payload'
import { syncOrderPayments } from '@/lib/payments'
import { payOrderAction } from '../../actions'
import { ActionForm } from '../../components/Forms'
import { OrderSummary } from '../../components/OrderSummary'
import { SessionBounce } from './SessionBounce'
import { privatePage } from '@/lib/seo'

export const metadata = privatePage('Payment')

export const dynamic = 'force-dynamic'

// "open" means the customer came back without paying; pending/authorized are still being processed
const FAILED_STATUSES = ['open', 'canceled', 'expired', 'failed']
const MAX_REFRESHES = 8

const relationId = (value: number | { id: number }) =>
  typeof value === 'object' ? value.id : value

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

/** Customers land here after the payment page. The status always comes from the provider, never from the URL. */
export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string; bounced?: string; r?: string }>
}) {
  const { order: orderNumber = '', token = '', bounced, r = '0' } = await searchParams
  const customer = await getCurrentCustomer()

  if (!customer && !bounced) {
    const params = new URLSearchParams({ order: orderNumber, token, bounced: '1' })
    return <SessionBounce href={`/payment/return?${params}`} />
  }

  const payload = await getPayloadClient()

  // access with the order's secret token, or as the logged-in owner
  const { docs } = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: orderNumber } },
    limit: 1,
  })
  let order = docs[0]
  const isOwner = customer && order && relationId(order.customer) === customer.id
  if (!order || !(isOwner || (token && safeEqual(token, order.accessToken ?? '')))) notFound()

  // the webhook may not have arrived yet (or cannot reach localhost), so check with the provider directly
  if (order.status === 'pending_payment' && order.payment?.paymentId) {
    try {
      order = await syncOrderPayments(payload, order)
    } catch (err) {
      payload.logger.error({ err, msg: `Payment sync failed for ${orderNumber}` })
    }
  }

  const paid = ['paid', 'processing', 'shipped'].includes(order.status)
  const closed = order.status === 'cancelled' || order.status === 'refunded'
  const failed =
    order.status === 'pending_payment' &&
    FAILED_STATUSES.includes(order.payment?.providerStatus ?? '')
  const pending = order.status === 'pending_payment' && !failed
  // stop refreshing after ~30 s: some banks take minutes, the customer then gets an email
  const attempt = Math.max(parseInt(r, 10) || 0, 0)
  const keepPolling = pending && attempt < MAX_REFRESHES
  const refreshUrl = `/payment/return?${new URLSearchParams({ order: orderNumber, token, bounced: '1', r: String(attempt + 1) })}`

  return (
    <section className="container section narrow">
      {paid && (
        <div className="result result-success">
          <h1>Payment successful</h1>
          <p>
            Thank you{customer ? `, ${customer.firstName}` : ''}! A confirmation has been sent to{' '}
            <strong>{order.email}</strong>.
          </p>
        </div>
      )}
      {failed && (
        <div className="result result-error">
          <h1>Payment not completed</h1>
          <p>The payment was not completed and no money has been taken. You can try again below.</p>
          <ActionForm action={payOrderAction} className="inline-form" submitLabel="Try again">
            <input name="order" type="hidden" value={order.orderNumber!} />
            <input name="token" type="hidden" value={order.accessToken ?? ''} />
          </ActionForm>
        </div>
      )}
      {pending && keepPolling && (
        <div className="result result-pending">
          <meta content={`4;url=${refreshUrl}`} httpEquiv="refresh" />
          <h1>Processing your payment…</h1>
          <p>This usually takes a few seconds. This page will update automatically.</p>
        </div>
      )}
      {pending && !keepPolling && (
        <div className="result result-pending">
          <h1>Waiting for your bank</h1>
          <p>
            Your bank is still confirming the payment. You can safely close this page: we will email{' '}
            <strong>{order.email}</strong> as soon as it is confirmed. No need to pay again.
          </p>
        </div>
      )}
      {closed && (
        <div className="result result-error">
          <h1>{order.status === 'refunded' ? 'Order refunded' : 'Order cancelled'}</h1>
          <p>
            {order.status === 'refunded'
              ? 'This order has been refunded.'
              : 'This order was cancelled because it was not paid in time. No money has been taken.'}{' '}
            <Link href="/#product">Place a new order</Link>
          </p>
        </div>
      )}

      <OrderSummary order={order} />
      <p>
        <Link href="/account">Go to my account</Link>
      </p>
    </section>
  )
}

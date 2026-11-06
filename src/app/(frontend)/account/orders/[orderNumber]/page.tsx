import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPayloadClient, requireCustomer } from '@/lib/payload'
import { payOrderAction } from '../../../actions'
import { ActionForm } from '../../../components/Forms'
import { OrderSummary } from '../../../components/OrderSummary'
import { privatePage } from '@/lib/seo'

export const metadata = privatePage('Order')

export const dynamic = 'force-dynamic'

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const customer = await requireCustomer(`/account/orders/${orderNumber}`)
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: orderNumber } },
    overrideAccess: false,
    user: customer,
    limit: 1,
  })
  const order = docs[0]
  if (!order) notFound()

  return (
    <section className="container section narrow">
      <p>
        <Link href="/account">← Back to my account</Link>
      </p>
      <OrderSummary order={order} />
      {order.status === 'pending_payment' && (
        <ActionForm action={payOrderAction} className="inline-form" submitLabel="Pay now">
          <input name="order" type="hidden" value={order.orderNumber!} />
        </ActionForm>
      )}
    </section>
  )
}

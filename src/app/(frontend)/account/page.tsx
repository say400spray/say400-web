import Link from 'next/link'

import { COUNTRIES } from '@/lib/countries'
import { formatMoney } from '@/lib/orderStatus'
import { getPayloadClient, hasShippingAddress, requireCustomer } from '@/lib/payload'
import { updateDetailsAction } from '../actions'
import { ActionForm } from '../components/Forms'
import { StatusBadge } from '../components/OrderSummary'
import { privatePage } from '@/lib/seo'

export const metadata = privatePage('My account')

export const dynamic = 'force-dynamic'

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; welcome?: string }>
}) {
  const { next = '', welcome } = await searchParams
  const customer = await requireCustomer('/account')
  const payload = await getPayloadClient()
  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: { customer: { equals: customer.id } },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  })
  const s = customer.shipping ?? {}

  return (
    <section className="container section account">
      <h1>Hello, {customer.firstName}</h1>
      {welcome && <p className="alert alert-success">Your account has been created.</p>}
      {next && !hasShippingAddress(customer) && (
        <p className="alert alert-info">
          Please add your delivery address to continue to checkout.
        </p>
      )}

      <div className="account-grid">
        <div className="card">
          <h2>Delivery details</h2>
          <p className="muted small">
            We ship from the UK to the United Kingdom and all EU countries.
          </p>
          <ActionForm
            action={updateDetailsAction}
            submitLabel={next ? 'Save and continue' : 'Save details'}
          >
            <input name="next" type="hidden" value={next} />
            <div className="row">
              <label>
                First name
                <input
                  autoComplete="given-name"
                  defaultValue={customer.firstName}
                  name="firstName"
                  required
                />
              </label>
              <label>
                Last name
                <input
                  autoComplete="family-name"
                  defaultValue={customer.lastName}
                  name="lastName"
                  required
                />
              </label>
            </div>
            <label>
              Phone
              <input
                autoComplete="tel"
                defaultValue={customer.phone ?? ''}
                name="phone"
                type="tel"
              />
            </label>
            <label>
              Country
              <select
                autoComplete="country"
                defaultValue={s.country || 'GB'}
                name="country"
                required
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Address line 1
              <input
                autoComplete="address-line1"
                defaultValue={s.line1 ?? ''}
                name="line1"
                required
              />
            </label>
            <label>
              <span>
                Address line 2 <span className="optional">optional</span>
              </span>
              <input autoComplete="address-line2" defaultValue={s.line2 ?? ''} name="line2" />
            </label>
            <div className="row">
              <label>
                Town / City
                <input
                  autoComplete="address-level2"
                  defaultValue={s.city ?? ''}
                  name="city"
                  required
                />
              </label>
              <label>
                <span>
                  County / Region <span className="optional">optional</span>
                </span>
                <input autoComplete="address-level1" defaultValue={s.county ?? ''} name="county" />
              </label>
            </div>
            <label>
              Postcode
              <input
                autoComplete="postal-code"
                defaultValue={s.postcode ?? ''}
                name="postcode"
                required
              />
            </label>
            <label className="checkbox">
              <input
                defaultChecked={Boolean(customer.marketingConsent)}
                name="marketing"
                type="checkbox"
              />
              <span>Send me exclusive offers and discounts by email.</span>
            </label>
          </ActionForm>
        </div>

        <div className="card">
          <h2>My orders</h2>
          {orders.length === 0 ? (
            <p className="muted">
              No orders yet. <Link href="/#products">Browse products</Link>
            </p>
          ) : (
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link href={`/account/orders/${order.orderNumber}`}>
                    <span>
                      <strong>{order.orderNumber}</strong>
                      <span className="muted">
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </span>
                    <span>{formatMoney(order.total, order.currency)}</span>
                    <StatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

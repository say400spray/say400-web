import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { addressLines, currencyFor } from '@/lib/countries'
import { formatMoney } from '@/lib/orderStatus'
import { quoteOrder } from '@/lib/checkout'
import { getPayloadClient, hasShippingAddress, requireCustomer } from '@/lib/payload'
import { pickSize, pickVariant, toVariantOption } from '@/lib/variants'
import { placeOrderAction } from '../actions'
import { ActionForm } from '../components/Forms'
import { privatePage } from '@/lib/seo'

export const metadata = privatePage('Checkout')

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; variant?: string; size?: string; qty?: string }>
}) {
  const {
    product: slug = '',
    variant: variantId = '',
    size: sizeId = '',
    qty = '1',
  } = await searchParams
  const quantity = Math.min(Math.max(parseInt(qty, 10) || 1, 1), 10)
  const here = `/checkout?product=${encodeURIComponent(slug)}${
    variantId ? `&variant=${encodeURIComponent(variantId)}` : ''
  }${sizeId ? `&size=${encodeURIComponent(sizeId)}` : ''}&qty=${quantity}`

  const customer = await requireCustomer(here)
  if (!hasShippingAddress(customer)) redirect(`/account?next=${encodeURIComponent(here)}`)

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: false,
  })
  const product = docs[0]
  if (!product) notFound()
  const variant = pickVariant(product, variantId)
  const size = pickSize(product, sizeId)
  if (variant === undefined || size === undefined) {
    return (
      <section className="container section narrow">
        <h1>Checkout</h1>
        <p className="alert alert-info">
          This option is no longer available.{' '}
          <Link href={`/products/${product.slug}`}>Choose another</Link>
        </p>
      </section>
    )
  }
  const box = variant && toVariantOption(variant).front

  const s = customer.shipping!
  const currency = currencyFor(s.country)
  const quote = await quoteOrder(payload, { product, variant, size, quantity, currency, customer })
  const money = (amount: number) => formatMoney(amount, currency)

  if (!quote) {
    return (
      <section className="container section narrow">
        <h1>Checkout</h1>
        <p className="alert alert-info">
          {product.name} is not available for delivery to your country yet.{' '}
          <Link href={`/account?next=${encodeURIComponent(here)}`}>Change address</Link>
        </p>
      </section>
    )
  }

  const { offer, unitPrice, offerPrice, option, subtotal, discount, shippingFee, total } = quote

  return (
    <section className="container section narrow">
      <h1>Checkout</h1>
      <div className="card">
        <table className="order-table">
          <tbody>
            <tr>
              <td>
                <span className="checkout-item">
                  {box && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="checkout-thumb" src={box.url} />
                  )}
                  <span>
                    {product.name} × {quantity}
                    {option && <span className="checkout-variant">{option}</span>}
                    {offerPrice != null && (
                      <span className="checkout-offer">
                        {offer!.badge}: {quantity > 1 ? '1 × ' : ''}
                        <s>{money(unitPrice)}</s> {money(offerPrice)}
                      </span>
                    )}
                  </span>
                </span>
              </td>
              <td>{money(subtotal)}</td>
            </tr>
            {discount > 0 && (
              <tr className="discount-row">
                <td>
                  {offer!.badge}
                  <span className="checkout-variant">Welcome discount, {offer!.percent}% off</span>
                </td>
                <td>−{money(discount)}</td>
              </tr>
            )}
            <tr>
              <td>Shipping</td>
              <td>{shippingFee ? money(shippingFee) : 'Free'}</td>
            </tr>
            <tr className="total">
              <td>Total</td>
              <td>{money(total)}</td>
            </tr>
          </tbody>
        </table>

        <h3>Deliver to</h3>
        <p>
          {addressLines({ ...s, fullName: `${customer.firstName} ${customer.lastName}` }).map(
            (line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ),
          )}
        </p>
        <p>
          <Link href={`/account?next=${encodeURIComponent(here)}`}>Change address</Link>
        </p>
        {currency === 'EUR' && (
          <p className="muted small">
            Ships from the United Kingdom. See our{' '}
            <Link href="/legal/shipping">shipping policy</Link> for delivery times and customs
            information.
          </p>
        )}

        <ActionForm
          action={placeOrderAction}
          pendingLabel="Redirecting to payment…"
          submitLabel={`Pay ${money(total)}`}
        >
          <input name="product" type="hidden" value={product.slug} />
          {variant && <input name="variant" type="hidden" value={variant.id} />}
          {size?.id && <input name="size" type="hidden" value={size.id} />}
          <input name="qty" type="hidden" value={quantity} />
          <p className="muted small legal-note">
            By placing your order you agree to our{' '}
            <Link href="/legal/terms">Terms &amp; Conditions</Link> and confirm you have read our{' '}
            <Link href="/legal/privacy">Privacy Policy</Link> and your{' '}
            <Link href="/legal/returns">right to cancel</Link>.
          </p>
        </ActionForm>
        <p className="muted small">
          You will be redirected to Mollie to complete the payment securely.
        </p>
      </div>
    </section>
  )
}

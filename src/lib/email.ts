import { Resend } from 'resend'

import type { Order, SampleRequest } from '../payload-types'
import { addressLines } from './countries'
import { formatMoney } from './orderStatus'
import { siteUrl } from './site'

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  resend ??= new Resend(process.env.RESEND_API_KEY)
  return resend
}

/** Sends through Resend, or logs to the console while no API key is configured. */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const client = getResend()
  if (!client) {
    console.log(`[email:not-sent] RESEND_API_KEY missing. To: ${to} | Subject: ${subject}`)
    return
  }
  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM || 'Shop <onboarding@resend.dev>',
    to,
    subject,
    html,
  })
  if (error) throw new Error(`Resend: ${error.message}`)
}

const escape = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

function orderSummaryHtml(order: Order): string {
  const money = (amount: number) => formatMoney(amount, order.currency)
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${escape(item.name)} × ${item.quantity}</td><td align="right">${money(item.unitPrice * item.quantity)}</td></tr>`,
    )
    .join('')
  const address = addressLines(order.shippingAddress).map(escape).join('<br>')

  return `
    <table width="100%" cellpadding="4" style="border-collapse:collapse">
      ${rows}
      ${order.discount ? `<tr><td>First-order discount</td><td align="right">−${money(order.discount)}</td></tr>` : ''}
      <tr><td>Shipping</td><td align="right">${money(order.shippingFee)}</td></tr>
      <tr><td><strong>Total</strong></td><td align="right"><strong>${money(order.total)}</strong></td></tr>
    </table>
    <h3>Delivery address</h3>
    <p>${address}</p>
    <p><a href="${siteUrl()}/account/orders/${escape(order.orderNumber)}">View your order</a></p>`
}

export async function sendOrderConfirmationEmail(order: Order) {
  await sendEmail({
    to: order.email,
    subject: `Order ${order.orderNumber} confirmed`,
    html: `<h2>Thank you for your order!</h2>
      <p>We have received your payment for order <strong>${escape(order.orderNumber)}</strong>.</p>
      ${orderSummaryHtml(order)}`,
  })
}

export async function sendOrderShippedEmail(order: Order) {
  const s = order.shipment
  const tracking = s?.trackingNumber
    ? `<p>Carrier: ${escape(s.carrier)}<br>Tracking number: <strong>${escape(s.trackingNumber)}</strong></p>`
    : ''
  await sendEmail({
    to: order.email,
    subject: `Order ${order.orderNumber} has been shipped`,
    html: `<h2>Your order is on its way</h2>
      <p>Order <strong>${escape(order.orderNumber)}</strong> has been shipped.</p>
      ${tracking}
      ${orderSummaryHtml(order)}`,
  })
}

export async function sendSampleReviewEmail(request: SampleRequest) {
  const name = request.shippingAddress.fullName.split(/\s+/)[0]
  await sendEmail({
    to: request.email,
    subject: 'How did you find your free sample?',
    html: `<h2>Hi ${escape(name)}, how was it?</h2>
      <p>A few days ago we sent you a free sample. Once you have tried it, we would really value your honest opinion, good or bad. It takes a minute and helps other customers decide.</p>
      <p><a href="${siteUrl()}/free-sample#review">Leave your review</a></p>
      <p style="color:#888;font-size:12px">You received this email because you asked for a free sample. Your review is shown with a "Free sample" label.</p>`,
  })
}

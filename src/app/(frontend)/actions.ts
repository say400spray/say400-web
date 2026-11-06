'use server'

import config from '@payload-config'
import { login, logout } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'
import { ValidationError } from 'payload'

import { getCurrentCustomer, getPayloadClient, hasShippingAddress } from '@/lib/payload'
import { startPaymentForOrder } from '@/lib/payments'
import { countryName, currencyFor, isSupportedCountry, normalizePostcode } from '@/lib/countries'
import { quoteOrder } from '@/lib/checkout'
import { getSampleCampaign } from '@/lib/samples'
import { safePath } from '@/lib/site'
import { pickSize, pickVariant } from '@/lib/variants'

export type FormState = { error?: string; success?: string }

const MAX_QUANTITY = 10

const str = (form: FormData, key: string) => String(form.get(key) ?? '').trim()

const safeNext = safePath

function errorMessage(err: unknown): string {
  if (err instanceof ValidationError) {
    return err.data.errors.map((e) => e.message).join(' ')
  }
  return err instanceof Error ? err.message : 'Something went wrong, please try again.'
}

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email').toLowerCase()
  const password = str(form, 'password')
  const firstName = str(form, 'firstName')
  const lastName = str(form, 'lastName')

  if (!email || !firstName || !lastName) return { error: 'Please fill in all fields.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (form.get('adult') !== 'on') return { error: 'You must be 18 or older to register.' }

  const payload = await getPayloadClient()
  try {
    await payload.create({
      collection: 'customers',
      data: {
        email,
        password,
        firstName,
        lastName,
        marketingConsent: form.get('marketing') === 'on',
      },
    })
    await login({ collection: 'customers', config, email, password })
  } catch (err) {
    const message = errorMessage(err)
    if (/email/i.test(message) && /(unique|registered|exists)/i.test(message)) {
      return { error: 'An account with this email already exists. Please log in.' }
    }
    return { error: message }
  }
  redirect(safeNext(str(form, 'next'), '/account?welcome=1'))
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    await login({
      collection: 'customers',
      config,
      email: str(form, 'email').toLowerCase(),
      password: str(form, 'password'),
    })
  } catch {
    return { error: 'Incorrect email or password.' }
  }
  redirect(safeNext(str(form, 'next'), '/account'))
}

export async function logoutAction() {
  await logout({ config })
  redirect('/')
}

export async function updateDetailsAction(_: FormState, form: FormData): Promise<FormState> {
  const customer = await getCurrentCustomer()
  if (!customer) return { error: 'Your session has expired. Please log in again.' }

  const country = str(form, 'country')
  if (!isSupportedCountry(country)) return { error: 'We currently ship to the UK and the EU only.' }
  const postcode = normalizePostcode(country, str(form, 'postcode'))
  if (!postcode) return { error: `Please enter a valid postcode for ${countryName(country)}.` }

  const data = {
    firstName: str(form, 'firstName'),
    lastName: str(form, 'lastName'),
    phone: str(form, 'phone'),
    marketingConsent: form.get('marketing') === 'on',
    shipping: {
      line1: str(form, 'line1'),
      line2: str(form, 'line2'),
      city: str(form, 'city'),
      county: str(form, 'county'),
      postcode,
      country,
    },
  }
  if (!data.firstName || !data.lastName || !data.shipping.line1 || !data.shipping.city) {
    return { error: 'Please fill in your name, address line 1 and town / city.' }
  }

  const payload = await getPayloadClient()
  try {
    await payload.update({
      collection: 'customers',
      id: customer.id,
      data,
      overrideAccess: false,
      user: customer,
    })
  } catch (err) {
    return { error: errorMessage(err) }
  }

  const next = str(form, 'next')
  if (next) redirect(safeNext(next, '/account'))
  return { success: 'Your details have been saved.' }
}

/** Creates the order from the checkout form and sends the customer to the payment page. */
export async function placeOrderAction(_: FormState, form: FormData): Promise<FormState> {
  const customer = await getCurrentCustomer()
  if (!customer) return { error: 'Your session has expired. Please log in again.' }
  if (!hasShippingAddress(customer)) return { error: 'Please add your delivery address first.' }

  const slug = str(form, 'product')
  const quantity = Math.min(Math.max(parseInt(str(form, 'qty'), 10) || 1, 1), MAX_QUANTITY)

  const payload = await getPayloadClient()
  let checkoutUrl: string
  try {
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug }, active: { equals: true } },
      limit: 1,
    })
    const product = docs[0]
    if (!product) return { error: 'This product is no longer available.' }
    const variant = pickVariant(product, str(form, 'variant'))
    const size = pickSize(product, str(form, 'size'))
    if (variant === undefined || size === undefined) {
      return { error: 'This option is no longer available. Please choose another.' }
    }

    const s = customer.shipping!
    const currency = currencyFor(s.country)
    const quote = await quoteOrder(payload, {
      product,
      variant,
      size,
      quantity,
      currency,
      customer,
    })
    if (!quote) return { error: 'This product is not available in your country yet.' }

    const order = await payload.create({
      collection: 'orders',
      data: {
        status: 'pending_payment',
        customer: customer.id,
        email: customer.email,
        items: quote.items,
        subtotal: quote.subtotal,
        discount: quote.discount,
        shippingFee: quote.shippingFee,
        total: quote.total,
        currency,
        shippingAddress: {
          fullName: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          line1: s.line1!,
          line2: s.line2,
          city: s.city!,
          county: s.county,
          postcode: s.postcode!,
          country: s.country!,
        },
      },
    })
    checkoutUrl = await startPaymentForOrder(payload, order)
  } catch (err) {
    payload.logger.error({ err, msg: 'Checkout failed' })
    return { error: 'We could not start the payment. Please try again in a moment.' }
  }
  redirect(checkoutUrl)
}

/** Starts a new payment attempt for an order that is still awaiting payment. */
export async function payOrderAction(_: FormState, form: FormData): Promise<FormState> {
  const customer = await getCurrentCustomer()
  const token = str(form, 'token')
  if (!customer && !token) return { error: 'Your session has expired. Please log in again.' }

  const payload = await getPayloadClient()
  let checkoutUrl: string
  try {
    const { docs } = await payload.find({
      collection: 'orders',
      where: {
        orderNumber: { equals: str(form, 'order') },
        // owner, or anyone holding the order's secret token from the payment return link
        ...(customer ? { customer: { equals: customer.id } } : { accessToken: { equals: token } }),
      },
      limit: 1,
    })
    const order = docs[0]
    if (!order || order.status !== 'pending_payment') {
      return { error: 'This order can no longer be paid.' }
    }
    checkoutUrl = await startPaymentForOrder(payload, order)
  } catch (err) {
    payload.logger.error({ err, msg: 'Retry payment failed' })
    return { error: 'We could not start the payment. Please try again in a moment.' }
  }
  redirect(checkoutUrl)
}

/** Handle as typed by the customer, trimmed and kept short (only read by staff). */
const handle = (form: FormData, key: string) => str(form, key).slice(0, 120)

/** Free sample request from /free-sample: one per customer, while samples are left. */
export async function requestSampleAction(_: FormState, form: FormData): Promise<FormState> {
  const customer = await getCurrentCustomer()
  if (!customer) return { error: 'Your session has expired. Please log in again.' }
  if (!hasShippingAddress(customer)) return { error: 'Please add your delivery address first.' }
  if (form.get('honest') !== 'on') {
    return { error: 'Please confirm you will share your honest opinion after trying it.' }
  }

  const payload = await getPayloadClient()
  const campaign = await getSampleCampaign(payload)
  if (!campaign) return { error: 'The free sample campaign is not running at the moment.' }
  if (campaign.remaining <= 0) return { error: 'Sorry, all free samples have been claimed.' }

  const { totalDocs: already } = await payload.count({
    collection: 'sample-requests',
    where: { customer: { equals: customer.id } },
  })
  if (already) return { error: 'You have already asked for a free sample.' }

  const s = customer.shipping!
  try {
    await payload.create({
      collection: 'sample-requests',
      data: {
        status: 'requested',
        customer: customer.id,
        email: customer.email,
        shippingAddress: {
          fullName: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          line1: s.line1!,
          line2: s.line2,
          city: s.city!,
          county: s.county,
          postcode: s.postcode!,
          country: s.country!,
        },
        socials: {
          instagram: handle(form, 'instagram'),
          tiktok: handle(form, 'tiktok'),
          facebook: handle(form, 'facebook'),
          telegram: handle(form, 'telegram'),
        },
      },
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'Sample request failed' })
    return { error: 'We could not save your request. Please try again in a moment.' }
  }
  redirect('/free-sample?requested=1')
}

/** The honest review of a free sample, left once it has been sent. Published after approval. */
export async function sampleReviewAction(_: FormState, form: FormData): Promise<FormState> {
  const customer = await getCurrentCustomer()
  if (!customer) return { error: 'Your session has expired. Please log in again.' }

  const rating = parseInt(str(form, 'rating'), 10)
  const text = str(form, 'text')
  if (!(rating >= 1 && rating <= 5)) return { error: 'Please choose a rating from 1 to 5 stars.' }
  if (text.length < 20) return { error: 'Please write a few words more (at least 20 characters).' }
  if (text.length > 1500) return { error: 'Please keep your review under 1500 characters.' }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'sample-requests',
    where: { customer: { equals: customer.id } },
    limit: 1,
    depth: 0,
  })
  const request = docs[0]
  if (!request || request.status !== 'sent') {
    return { error: 'You can leave a review once your free sample has been sent.' }
  }

  try {
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { active: { equals: true } },
      sort: 'createdAt',
      limit: 1,
      depth: 0,
    })
    const review = await payload.create({
      collection: 'reviews',
      data: {
        name: `${customer.firstName} ${customer.lastName.charAt(0)}.`.trim(),
        country: countryName(request.shippingAddress.country),
        rating,
        text,
        product: products[0]?.id,
        variant: request.variant,
        freeSample: true,
        approved: false,
      },
    })
    await payload.update({
      collection: 'sample-requests',
      id: request.id,
      data: { status: 'reviewed', review: review.id },
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'Sample review failed' })
    return { error: 'We could not save your review. Please try again in a moment.' }
  }
  redirect('/free-sample?reviewed=1')
}

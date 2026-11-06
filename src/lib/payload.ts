import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import type { Customer } from '../payload-types'
import { type Currency, isSupportedCountry } from './countries'

// cron: true starts the scheduled jobs (e.g. cancelling unpaid orders) with the first request
export const getPayloadClient = () => getPayload({ config, cron: true })

/** The logged-in customer, or null (admins logged into the panel are not customers). */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await getHeaders() })
  return user?.collection === 'customers' ? (user as Customer) : null
}

export async function requireCustomer(next: string): Promise<Customer> {
  const customer = await getCurrentCustomer()
  if (!customer) redirect(`/login?next=${encodeURIComponent(next)}`)
  return customer
}

export function hasShippingAddress(customer: Customer): boolean {
  const s = customer.shipping
  return Boolean(s?.line1 && s.city && s.postcode && isSupportedCountry(s.country))
}

/** Shipping fee in the order currency (UK orders in GBP, EU orders in EUR). */
export async function getShippingFee(subtotal: number, currency: Currency): Promise<number> {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'shop-settings' })
  const [fee, freeFrom] =
    currency === 'GBP'
      ? [settings.shippingFee, settings.freeShippingFrom]
      : [settings.euShippingFee, settings.euFreeShippingFrom]
  if (freeFrom != null && subtotal >= freeFrom) return 0
  return fee ?? 0
}

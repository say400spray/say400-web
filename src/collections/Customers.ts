import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, isAdminField, isAdminOrSelf } from '../access'
import { isSupportedCountry, normalizePostcode } from '../lib/countries'

/** Shop customers. They log in on the website, never in the admin panel. */
export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'marketingConsent', 'createdAt'],
    group: 'Shop',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
  },
  access: {
    create: anyone,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
      ],
    },
    { name: 'phone', type: 'text' },
    {
      name: 'shipping',
      label: 'Shipping address',
      type: 'group',
      fields: [
        {
          name: 'country',
          type: 'text',
          defaultValue: 'GB',
          admin: { description: 'ISO code, e.g. GB, DE, FR' },
          validate: (value: string | null | undefined) =>
            !value || isSupportedCountry(value) ? true : 'We only ship to the UK and the EU',
        },
        { name: 'line1', label: 'Address line 1', type: 'text' },
        { name: 'line2', label: 'Address line 2', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'city', label: 'Town / City', type: 'text' },
            { name: 'county', label: 'County / Region', type: 'text' },
            {
              name: 'postcode',
              type: 'text',
              validate: (
                value: string | null | undefined,
                { siblingData }: { siblingData: { country?: string } },
              ) =>
                !value || normalizePostcode(siblingData.country || 'GB', value)
                  ? true
                  : 'Enter a valid postcode for the selected country',
            },
          ],
        },
      ],
    },
    {
      name: 'marketingConsent',
      label: 'Agreed to receive promotional emails',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'marketingConsentAt',
      type: 'date',
      access: { update: isAdminField },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.shipping?.postcode) {
          data.shipping.postcode =
            normalizePostcode(data.shipping.country || 'GB', data.shipping.postcode) ??
            data.shipping.postcode
        }
        // record when consent was given (UK GDPR / PECR proof of opt-in)
        if (data.marketingConsent && !originalDoc?.marketingConsent) {
          data.marketingConsentAt = new Date().toISOString()
        } else if (data.marketingConsent === false) {
          data.marketingConsentAt = null
        }
        return data
      },
    ],
  },
}

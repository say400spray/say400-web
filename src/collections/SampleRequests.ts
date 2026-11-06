import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrOwner } from '../access'

export const SAMPLE_STATUSES = [
  { label: 'Requested', value: 'requested' },
  { label: 'Sent', value: 'sent' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Rejected', value: 'rejected' },
] as const

/**
 * Free sample requests, created from the /free-sample page (one per customer). Staff check
 * the request, post the sample and set "Sent"; the review email follows a few days later.
 */
export const SampleRequests: CollectionConfig = {
  slug: 'sample-requests',
  labels: { singular: 'Free sample', plural: 'Free samples' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'shippingAddress.fullName', 'status', 'variant', 'createdAt'],
    group: 'Shop',
    listSearchableFields: ['email'],
    description:
      'Check the request (address, social accounts), post the sample, then set the status to "Sent". The customer is asked for an honest review a few days later.',
  },
  access: {
    read: isAdminOrOwner,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'requested',
      options: SAMPLE_STATUSES.map((s) => ({ label: s.label, value: s.value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    { name: 'email', type: 'email', required: true, admin: { position: 'sidebar' } },
    {
      name: 'variant',
      label: 'Box sent',
      type: 'text',
      admin: {
        position: 'sidebar',
        placeholder: 'e.g. Gold',
        description: 'Colour of the sample box. Copied to the review.',
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: { position: 'sidebar', description: 'Filled in when the status is set to "Sent"' },
    },
    {
      name: 'reviewEmailSentAt',
      label: 'Review email sent',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'review',
      type: 'relationship',
      relationTo: 'reviews',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'fullName', type: 'text', required: true },
            { name: 'phone', type: 'text' },
          ],
        },
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', required: true },
            { name: 'county', type: 'text' },
            { name: 'postcode', type: 'text', required: true },
            { name: 'country', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'socials',
      label: 'Social accounts (to check the follows)',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'instagram', type: 'text' },
            { name: 'tiktok', label: 'TikTok', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'facebook', type: 'text' },
            { name: 'telegram', type: 'text' },
          ],
        },
      ],
    },
    { name: 'notes', label: 'Internal notes', type: 'textarea' },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.status === 'sent' && originalDoc?.status !== 'sent') {
          data.sentAt ??= new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || doc.status !== 'sent' || previousDoc?.status === 'sent') {
          return doc
        }
        try {
          const settings = await req.payload.findGlobal({ slug: 'shop-settings', req })
          const days = settings.freeSamples?.reviewEmailDays ?? 7
          const waitUntil = new Date(new Date(doc.sentAt ?? Date.now()).getTime() + days * 864e5)
          await req.payload.jobs.queue({
            task: 'sampleReviewEmail',
            input: { request: doc.id },
            queue: 'maintenance',
            waitUntil,
            req,
          })
        } catch (err) {
          req.payload.logger.error({
            err,
            msg: `Could not schedule the review email for ${doc.email}`,
          })
        }
        return doc
      },
    ],
  },
}

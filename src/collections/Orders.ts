import { randomBytes } from 'crypto'
import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrOwner } from '../access'
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from '../lib/email'
import { ORDER_STATUSES } from '../lib/orderStatus'

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '') // YYMMDD
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `MS-${date}-${random}`
}

/**
 * Orders are created by the website (server side, with overrideAccess) and
 * moved to "paid" by the payment webhook. Staff manage the rest in the admin.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: [
      'orderNumber',
      'itemsSummary',
      'customer',
      'total',
      'currency',
      'status',
      'createdAt',
    ],
    group: 'Shop',
    listSearchableFields: ['orderNumber', 'email', 'paymentId'],
  },
  access: {
    read: isAdminOrOwner,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      // secret in the payment return URL, so the result page works even if the
      // browser drops the session cookie on the cross-site redirect from the provider
      name: 'accessToken',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending_payment',
      options: ORDER_STATUSES.map((s) => ({ label: s.label, value: s.value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: { position: 'sidebar' },
    },
    { name: 'email', type: 'email', required: true, admin: { position: 'sidebar' } },
    {
      // what to pack, readable at a glance in the orders list
      name: 'itemsSummary',
      label: 'Items',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'product', type: 'relationship', relationTo: 'products' },
            // name and price are copied so the order stays correct if the product changes later
            { name: 'name', type: 'text', required: true },
            // colour & strength of the box to pack, e.g. "Gold · 50 mg"
            { name: 'variant', type: 'text' },
            { name: 'unitPrice', type: 'number', required: true },
            { name: 'quantity', type: 'number', required: true, min: 1 },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', required: true },
        {
          name: 'discount',
          label: 'First-order discount',
          type: 'number',
          defaultValue: 0,
          admin: { readOnly: true },
        },
        { name: 'shippingFee', type: 'number', required: true, defaultValue: 0 },
        { name: 'total', type: 'number', required: true },
        { name: 'currency', type: 'text', defaultValue: 'GBP', admin: { readOnly: true } },
      ],
    },
    {
      name: 'shippingAddress',
      label: 'Shipping address (snapshot at order time)',
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
            {
              name: 'country',
              type: 'text',
              defaultValue: 'GB',
              admin: { description: 'ISO code' },
            },
          ],
        },
      ],
    },
    {
      name: 'payment',
      type: 'group',
      admin: { description: 'Filled in automatically by the payment provider' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'provider', type: 'text', admin: { readOnly: true } },
            { name: 'paymentId', type: 'text', index: true, admin: { readOnly: true } },
            { name: 'providerStatus', type: 'text', admin: { readOnly: true } },
            { name: 'paidAt', type: 'date', admin: { readOnly: true } },
          ],
        },
        {
          name: 'attemptIds',
          label: 'All payment attempts',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Every payment created for this order, oldest first',
          },
        },
      ],
    },
    {
      name: 'shipment',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'carrier', type: 'text', admin: { placeholder: 'Royal Mail, DPD, …' } },
            { name: 'trackingNumber', type: 'text' },
            { name: 'shippedAt', type: 'date' },
          ],
        },
      ],
    },
    { name: 'notes', label: 'Internal notes', type: 'textarea' },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        if (Array.isArray(data.items)) {
          data.itemsSummary = data.items
            .map((item: { name?: string; quantity?: number }) => `${item.name} × ${item.quantity}`)
            .join(', ')
        }
        if (operation === 'create') {
          data.orderNumber ||= generateOrderNumber()
          data.accessToken ||= randomBytes(24).toString('hex')
        }
        if (data.status === 'shipped' && originalDoc?.status !== 'shipped') {
          data.shipment = {
            ...data.shipment,
            shippedAt: data.shipment?.shippedAt ?? new Date().toISOString(),
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update' || doc.status === previousDoc?.status) return doc
        try {
          if (doc.status === 'paid') await sendOrderConfirmationEmail(doc)
          if (doc.status === 'shipped') await sendOrderShippedEmail(doc)
        } catch (err) {
          req.payload.logger.error({ err, msg: `Email for order ${doc.orderNumber} failed` })
        }
        return doc
      },
    ],
  },
}

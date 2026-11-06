import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access'

export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: 'Shop settings',
  admin: { group: 'Shop' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'announcement',
      label: 'Announcement bar (top of every page, empty = hidden)',
      type: 'text',
      defaultValue: 'Discreet, unbranded packaging · Ships from the UK to the UK & EU',
    },
    {
      name: 'firstOrderOffer',
      label: 'First-order offer',
      type: 'group',
      admin: {
        description:
          'One welcome offer for a customer’s first order: a percentage off, or (for sizes marked "First-order offer") a bigger size for the price of the first size. Announced in a pop-up and next to the price, applied automatically at checkout.',
      },
      fields: [
        { name: 'enabled', label: 'Offer is running', type: 'checkbox', defaultValue: false },
        {
          type: 'row',
          fields: [
            {
              name: 'kind',
              label: 'Offer',
              type: 'select',
              defaultValue: 'percent',
              options: [
                { label: 'Percentage off the first order', value: 'percent' },
                {
                  label: 'Bigger size for the price of the first size (e.g. 12 ml for 6 ml)',
                  value: 'size',
                },
              ],
            },
            {
              name: 'percent',
              label: 'Discount (%)',
              type: 'number',
              defaultValue: 20,
              min: 1,
              max: 90,
              admin: {
                condition: (_, siblings) => siblings?.kind !== 'size',
                description: 'Taken off the products on a customer’s first order',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                placeholder: 'First order? Take 20% off.',
                description: 'Empty = a ready-made title. {percent} is replaced by the discount.',
              },
            },
            {
              name: 'badge',
              label: 'Short label next to the price',
              type: 'text',
              admin: { placeholder: 'First-order offer' },
            },
          ],
        },
        {
          name: 'text',
          label: 'Pop-up text',
          type: 'textarea',
          admin: {
            placeholder:
              'Join with your email and the discount is applied automatically at checkout.',
            description: 'Empty = a ready-made text. {percent} is replaced by the discount.',
          },
        },
      ],
    },
    {
      name: 'freeSamples',
      label: 'Free samples',
      type: 'group',
      admin: {
        description:
          'Free sample bottles for the first customers who ask. They try it first and are asked for an honest review afterwards. Requests are listed under Shop → Free samples.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'enabled',
              label: 'Campaign is running',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'limit',
              label: 'Number of samples',
              type: 'number',
              defaultValue: 500,
              min: 1,
              admin: {
                description: 'The page closes by itself once this many have been requested',
              },
            },
            {
              name: 'reviewEmailDays',
              label: 'Review email after (days)',
              type: 'number',
              defaultValue: 7,
              min: 1,
              max: 60,
              admin: {
                description: 'Days after a sample is marked "Sent" before asking for the review',
              },
            },
          ],
        },
        {
          name: 'sampleLabel',
          label: 'What is sent',
          type: 'text',
          defaultValue: '5 ml bottle',
          admin: { description: 'Shown on the page, e.g. "5 ml bottle"' },
        },
        {
          type: 'row',
          fields: [
            { name: 'instagram', label: 'Instagram link', type: 'text' },
            { name: 'tiktok', label: 'TikTok link', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'facebook', label: 'Facebook link', type: 'text' },
            { name: 'telegram', label: 'Telegram group link', type: 'text' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Shipping to the United Kingdom (GBP)',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'shippingFee',
              label: 'Shipping fee (GBP)',
              type: 'number',
              defaultValue: 0,
              min: 0,
            },
            {
              name: 'freeShippingFrom',
              label: 'Free shipping from (GBP, empty = never)',
              type: 'number',
              min: 0,
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Shipping to the EU (EUR)',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'euShippingFee',
              label: 'Shipping fee (EUR)',
              type: 'number',
              defaultValue: 0,
              min: 0,
            },
            {
              name: 'euFreeShippingFrom',
              label: 'Free shipping from (EUR, empty = never)',
              type: 'number',
              min: 0,
            },
          ],
        },
      ],
    },
  ],
}

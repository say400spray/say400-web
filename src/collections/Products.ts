import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'active', 'updatedAt'],
    group: 'Shop',
  },
  access: {
    // visitors only see active products
    read: ({ req: { user } }) => user?.collection === 'users' || { active: { equals: true } },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Used in the URL, e.g. "product-name"' },
    },
    { name: 'shortDescription', type: 'textarea' },
    { name: 'description', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          label: 'Price UK (GBP)',
          type: 'number',
          required: true,
          min: 0,
          admin: { step: 0.01 },
        },
        {
          name: 'priceEUR',
          label: 'Price EU (EUR)',
          type: 'number',
          min: 0,
          admin: { step: 0.01, description: 'Leave empty to not sell this product in the EU' },
        },
      ],
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Optional. When empty, the front of the first variant box is shown.' },
    },
    {
      name: 'variants',
      label: 'Variants (colour & strength)',
      type: 'array',
      labels: { singular: 'Variant', plural: 'Variants' },
      admin: {
        description:
          'One row per box. The customer picks one on the product page, and the order shows exactly which box to pack. Leave empty for a product without variants.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { placeholder: 'e.g. Gold' } },
            { name: 'strength', type: 'text', admin: { placeholder: 'e.g. 50 mg' } },
            {
              name: 'color',
              label: 'Colour code',
              type: 'text',
              required: true,
              admin: { placeholder: '#d9b45e', description: 'Colour of the dot customers click' },
              validate: (value: string | null | undefined) =>
                /^#[0-9a-f]{6}$/i.test(value ?? '') || 'Use a colour code like #d9b45e',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'price',
              label: 'Price UK (GBP)',
              type: 'number',
              min: 0,
              admin: { step: 0.01, description: 'Leave empty to use the product price' },
            },
            {
              name: 'priceEUR',
              label: 'Price EU (EUR)',
              type: 'number',
              min: 0,
              admin: { step: 0.01, description: 'Leave empty to use the product price' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'front', label: 'Box, front', type: 'upload', relationTo: 'media' },
            { name: 'back', label: 'Box, back', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'level',
              type: 'text',
              admin: {
                placeholder: 'e.g. Intense',
                description: 'Short name shown on the collection card',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'One or two sentences for the collection card' },
            },
          ],
        },
        { name: 'active', label: 'For sale', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'sizes',
      type: 'array',
      labels: { singular: 'Size', plural: 'Sizes' },
      admin: {
        description:
          'Optional, e.g. 6 ml and 12 ml. Put the smallest size first. When sizes are set, their prices replace the product and variant prices.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { placeholder: 'e.g. 12 ml' } },
            {
              name: 'price',
              label: 'Price UK (GBP)',
              type: 'number',
              required: true,
              min: 0,
              admin: { step: 0.01 },
            },
            {
              name: 'priceEUR',
              label: 'Price EU (EUR)',
              type: 'number',
              min: 0,
              admin: { step: 0.01 },
            },
          ],
        },
        {
          name: 'firstOrderDeal',
          label: 'First-order offer: a customer’s first order pays the price of the first size',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Turn the offer on or off for everyone in Shop settings → First-order offer',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Product details (shown on the product page)',
      fields: [
        { name: 'size', type: 'text', admin: { placeholder: 'e.g. 20 ml · approx. 100 sprays' } },
        {
          name: 'highlights',
          type: 'array',
          admin: { description: 'Short selling points, one per line' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        { name: 'howToUse', label: 'How to use', type: 'textarea' },
        { name: 'ingredients', type: 'textarea' },
        { name: 'warnings', label: 'Warnings', type: 'textarea' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.name) {
          data.slug = String(data.name)
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}

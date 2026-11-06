import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'
import { visibleReviewsWhere } from '../lib/reviews'

/**
 * Customer reviews. Only add real reviews from real customers: publishing invented
 * reviews is illegal in the UK (DMCC Act 2024) and the EU (Omnibus Directive).
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'product', 'approved', 'createdAt'],
    group: 'Content',
    description:
      'Only genuine reviews from real customers. Approved reviews appear on the website.',
  },
  access: {
    // visitors only see approved reviews, and sample reviews only on the private preview
    read: ({ req: { user } }) => user?.collection === 'users' || visibleReviewsWhere(),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          label: 'Display name',
          type: 'text',
          required: true,
          admin: { placeholder: 'e.g. James T.' },
        },
        { name: 'country', type: 'text', admin: { placeholder: 'e.g. United Kingdom' } },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5, defaultValue: 5 },
      ],
    },
    { name: 'text', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        {
          name: 'variant',
          label: 'Box bought',
          type: 'text',
          admin: {
            placeholder: 'e.g. Gold',
            description:
              'Colour name of the box, as in the product variants. Shows a coloured tag.',
          },
        },
      ],
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'The order this customer placed (marks the review as a verified purchase)',
      },
    },
    { name: 'approved', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      // the law asks for incentivised reviews to be labelled as such
      name: 'freeSample',
      label: 'Received a free sample',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Shown with a "Free sample" label. Set automatically for reviews left from the free sample page.',
      },
    },
    {
      // lets the client see the reviews section before real reviews exist, without ever publishing invented ones
      name: 'sample',
      label: 'Sample (private preview only)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Shown, labelled "Sample", only while the site is behind the preview password. Never shown on the public site or counted in the rating. Delete before launch.',
      },
    },
  ],
}

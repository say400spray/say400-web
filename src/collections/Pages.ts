import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '../access'

/** Legal and info pages (terms, privacy, cookies, returns, shipping), shown at /legal/<slug>. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    description:
      'Legal pages start from templates. Have them reviewed by a lawyer and fill in Company details before launch.',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'URL: /legal/<slug>' },
    },
    {
      name: 'showInFooter',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'footerOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    { name: 'content', type: 'richText', required: true },
  ],
}

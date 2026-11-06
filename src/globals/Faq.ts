import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access'

export const Faq: GlobalConfig = {
  slug: 'faq',
  label: 'FAQ',
  admin: { group: 'Content' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

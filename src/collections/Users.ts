import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

/** Shop staff with access to the admin panel. */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true,
  access: {
    read: isAdmin,
    // the very first user is created via /admin/create-first-user
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
}

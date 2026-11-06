import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => user?.collection === 'users'

export const isAdminField: FieldAccess = ({ req: { user } }) => user?.collection === 'users'

export const anyone: Access = () => true

/** Admins see everything, customers only their own customer document. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'users') return true
  return { id: { equals: user.id } }
}

/** Admins see everything, customers only documents where `customer` is themselves. */
export const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.collection === 'users') return true
  return { customer: { equals: user.id } }
}

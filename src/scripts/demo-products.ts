/**
 * Temporary demo products to preview the shop with several items.
 * Run with: pnpm payload run src/scripts/demo-products.ts
 * Delete them (or untick "active") in the admin once the real products are added.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const products = [
  {
    name: 'Tibet Spray Forte',
    shortDescription: 'Extra-strength formula for when it matters most.',
    price: 49.99,
    priceEUR: 57.99,
  },
  {
    name: 'Tibet Gel',
    shortDescription: 'A smooth, discreet gel in a pocket-size tube.',
    price: 34.99,
    priceEUR: 39.99,
  },
  {
    name: 'Tibet Duo',
    shortDescription: 'Spray + Gel. The complete set, at a better price.',
    price: 69.99,
    priceEUR: 79.99,
  },
]

const payload = await getPayload({ config })

for (const product of products) {
  const { totalDocs } = await payload.count({
    collection: 'products',
    where: { name: { equals: product.name } },
  })
  if (totalDocs > 0) continue
  await payload.create({
    collection: 'products',
    data: {
      ...product,
      slug: '',
      active: true,
      description: 'Demo product. Replace with the real product description, ingredients and directions for use.',
    },
  })
  payload.logger.info(`Created demo product "${product.name}"`)
}

process.exit(0)

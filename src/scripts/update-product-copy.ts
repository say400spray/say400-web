/**
 * Puts the product texts from the client's product information (shop-content.ts) into an
 * existing database: the Men Spray description, highlights, directions and warnings, and the
 * product questions at the top of the FAQ. Shipping, payment and returns answers stay as edited
 * in the admin. Run with: pnpm payload run src/scripts/update-product-copy.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { productFaqItems, sprayCopy } from './shop-content'

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'products',
  where: { slug: { equals: 'men-spray' } },
  limit: 1,
  depth: 0,
})
if (docs[0]) {
  await payload.update({
    collection: 'products',
    id: docs[0].id,
    data: {
      shortDescription: sprayCopy.shortDescription,
      description: sprayCopy.description,
      highlights: sprayCopy.highlights.map((text) => ({ text })),
      howToUse: sprayCopy.howToUse,
      warnings: sprayCopy.warnings,
    },
  })
  payload.logger.info('Updated the Men Spray texts')
}

const faq = await payload.findGlobal({ slug: 'faq' })
const productQuestions = new Set(productFaqItems.map((item) => item.question))
const rest = (faq.items ?? [])
  .filter((item) => !productQuestions.has(item.question))
  .map(({ question, answer }) => ({ question, answer }))
await payload.updateGlobal({ slug: 'faq', data: { items: [...productFaqItems, ...rest] } })
payload.logger.info(`FAQ: ${productFaqItems.length} product questions, then ${rest.length} others`)

process.exit(0)

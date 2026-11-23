/**
 * Each box colour has its own bottle and volume (3, 5, 6, 11, 12 ml), so the Men Spray gets:
 * colours ordered smallest to largest with their volume, level, card text and approximate prices,
 * no separate size picker, a 3 ml free sample, and the FAQ answer about the "6 ml" printed on
 * every box. Photos and other edits made in the admin stay as they are.
 * Run with: pnpm payload run src/scripts/update-volumes.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { boxVolumeFaq, productFaqItems, sprayBoxes } from './shop-content'

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'products',
  where: { slug: { equals: 'men-spray' } },
  limit: 1,
  depth: 0,
})
const product = docs[0]
if (!product) throw new Error('Men Spray not found')

const order = sprayBoxes.map((b) => b.name)
const variants = [...(product.variants ?? [])]
  .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  .map((v) => {
    const box = sprayBoxes.find((b) => b.name === v.name)
    if (!box) return v
    return {
      ...v,
      strength: box.volume,
      level: box.level,
      description: box.description,
      price: box.price,
      priceEUR: box.priceEUR,
    }
  })

const cheapest = sprayBoxes[0]
await payload.update({
  collection: 'products',
  id: product.id,
  data: {
    variants,
    sizes: [],
    size: '3–12 ml',
    price: cheapest.price,
    priceEUR: cheapest.priceEUR,
  },
})
payload.logger.info(
  `Men Spray: ${variants.map((v) => `${v.name} ${v.strength} £${v.price}`).join(', ')}; size picker removed`,
)

const settings = await payload.findGlobal({ slug: 'shop-settings' })
await payload.updateGlobal({
  slug: 'shop-settings',
  data: { freeSamples: { ...settings.freeSamples, sampleLabel: '3 ml bottle' } },
})
payload.logger.info('Free sample: 3 ml bottle')

// the "6 ml" answer goes right after the product questions, once
const faq = await payload.findGlobal({ slug: 'faq' })
const items = (faq.items ?? []).map(({ question, answer }) => ({ question, answer }))
if (!items.some((i) => i.question === boxVolumeFaq.question)) {
  const productQuestions = new Set(productFaqItems.map((p) => p.question))
  let after = -1
  items.forEach((item, i) => {
    if (productQuestions.has(item.question)) after = i
  })
  items.splice(after + 1, 0, boxVolumeFaq)
  await payload.updateGlobal({ slug: 'faq', data: { items } })
  payload.logger.info('FAQ: added the "6 ml" answer')
}

process.exit(0)

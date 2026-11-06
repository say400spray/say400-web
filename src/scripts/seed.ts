/**
 * Adds the Say400 product so the shop can be tested end to end.
 * Price and texts are placeholders: edit them in the admin panel.
 * Run with: pnpm seed
 */
import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import path from 'path'
import { getPayload } from 'payload'

import { legalPages } from './legal-content'
import {
  defaultAnnouncement,
  faqItems,
  sprayBoxDetails,
  sprayBoxes,
  tibetSprayDetails,
} from './shop-content'

const demoProducts = [
  {
    name: 'Men Spray',
    shortDescription: 'A discreet, natural men’s spray in five strengths.',
    description:
      'Say400 Men Spray comes in a discreet pocket-size bottle.\nPlaceholder text: replace with the official product description, ingredients and directions for use.',
    price: 39.99,
    priceEUR: 45.99,
  },
]

const payload = await getPayload({ config })

// the product was first called "Tibet Spray"; rename it once (old links redirect, see next.config.ts)
const { docs: legacy } = await payload.find({
  collection: 'products',
  where: { slug: { equals: 'tibet-spray' } },
  limit: 1,
  depth: 0,
})
if (legacy[0]) {
  await payload.update({
    collection: 'products',
    id: legacy[0].id,
    data: {
      name: 'Men Spray',
      slug: 'men-spray',
      shortDescription: legacy[0].shortDescription?.includes('Tibet')
        ? 'A discreet, natural men’s spray in five strengths.'
        : legacy[0].shortDescription,
      description: legacy[0].description?.replace('Tibet Spray', 'Men Spray'),
      highlights: legacy[0].highlights?.map((h) => ({
        ...h,
        text: h.text.includes('Tibetan')
          ? 'Botanical formula with acmella, damiana, ginkgo and ginseng'
          : h.text,
      })),
    },
  })
  payload.logger.info('Renamed "Tibet Spray" to "Men Spray"')
}

for (const product of demoProducts) {
  const { totalDocs } = await payload.count({
    collection: 'products',
    where: { name: { equals: product.name } },
  })
  if (totalDocs > 0) {
    payload.logger.info(`Skipping "${product.name}" (already exists)`)
    continue
  }
  await payload.create({ collection: 'products', data: { ...product, slug: '', active: true } })
  payload.logger.info(`Created "${product.name}"`)
}

// product details for the main product, only when still empty
const { docs: spray } = await payload.find({
  collection: 'products',
  where: { slug: { equals: 'men-spray' } },
  limit: 1,
})
if (spray[0] && !spray[0].howToUse) {
  await payload.update({ collection: 'products', id: spray[0].id, data: tibetSprayDetails })
  payload.logger.info('Added Men Spray details')
}

// the five boxes (colour & strength) with their front and back photos, only when none exist yet
const [sprayDoc] = (
  await payload.find({
    collection: 'products',
    where: { slug: { equals: 'men-spray' } },
    limit: 1,
    depth: 0,
  })
).docs
if (sprayDoc && !sprayDoc.variants?.length) {
  const boxesDir = path.resolve(process.cwd(), 'src/scripts/assets/boxes')
  const upload = async (file: string, alt: string) =>
    (
      await payload.create({
        collection: 'media',
        data: { alt },
        filePath: path.join(boxesDir, `${file}.webp`),
      })
    ).id
  const variants = []
  for (const box of sprayBoxes) {
    variants.push({
      name: box.name,
      color: box.color,
      level: box.level,
      description: box.description,
      front: await upload(box.file, `Say400 men spray, ${box.name} box, front`),
      back: await upload(
        `${box.file}-spate`,
        `Say400 men spray, ${box.name} box, back with ingredients and directions`,
      ),
      active: true,
    })
  }
  // box texts replace the [PLACEHOLDER] details, never what the client already wrote
  const details = Object.fromEntries(
    Object.entries(sprayBoxDetails).filter(([key]) => {
      const current = sprayDoc[key as keyof typeof sprayBoxDetails]
      return !current || current.includes('[')
    }),
  )
  await payload.update({ collection: 'products', id: sprayDoc.id, data: { variants, ...details } })
  payload.logger.info(`Added ${variants.length} box variants to Men Spray`)
}

// collection card texts for boxes that have none yet, in the lightest-to-strongest order
const [textDoc] = (
  await payload.find({
    collection: 'products',
    where: { slug: { equals: 'men-spray' } },
    limit: 1,
    depth: 0,
  })
).docs
if (textDoc?.variants?.length && textDoc.variants.every((v) => !v.level)) {
  const order = sprayBoxes.map((b) => b.name)
  const variants = [...textDoc.variants]
    .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
    .map((v) => {
      const box = sprayBoxes.find((b) => b.name === v.name)
      return { ...v, level: box?.level, description: box?.description }
    })
  await payload.update({ collection: 'products', id: textDoc.id, data: { variants } })
  payload.logger.info('Added collection texts to the box variants')
}

// 6, 10 and 12 ml; the 10 and 12 ml prices are placeholders and its first-order offer pays the 6 ml price
const [sizedDoc] = (
  await payload.find({
    collection: 'products',
    where: { slug: { equals: 'men-spray' } },
    limit: 1,
    depth: 0,
  })
).docs
if (sizedDoc && !sizedDoc.sizes?.length) {
  await payload.update({
    collection: 'products',
    id: sizedDoc.id,
    data: {
      sizes: [
        { label: '6 ml', price: sizedDoc.price, priceEUR: sizedDoc.priceEUR },
        { label: '10 ml', price: 59.99, priceEUR: 69.99 },
        { label: '12 ml', price: 69.99, priceEUR: 79.99, firstOrderDeal: true },
      ],
    },
  })
  payload.logger.info('Added 6, 10 and 12 ml sizes to Men Spray')
}

// FAQ and announcement bar, only when still empty
const faq = await payload.findGlobal({ slug: 'faq' })
if (!faq.items?.length) {
  await payload.updateGlobal({ slug: 'faq', data: { items: faqItems } })
  payload.logger.info('Created FAQ')
}
const settings = await payload.findGlobal({ slug: 'shop-settings' })
if (!settings.announcement) {
  await payload.updateGlobal({ slug: 'shop-settings', data: { announcement: defaultAnnouncement } })
}

// legal pages: created once from the templates, then edited in the admin
const editorConfig = await editorConfigFactory.default({ config: payload.config })
for (const page of legalPages) {
  const { totalDocs } = await payload.count({
    collection: 'pages',
    where: { slug: { equals: page.slug } },
  })
  if (totalDocs > 0) {
    payload.logger.info(`Skipping page "${page.title}" (already exists)`)
    continue
  }
  await payload.create({
    collection: 'pages',
    data: {
      title: page.title,
      slug: page.slug,
      footerOrder: page.footerOrder,
      showInFooter: true,
      content: convertMarkdownToLexical({ editorConfig, markdown: page.markdown.trim() }),
    },
  })
  payload.logger.info(`Created page "${page.title}"`)
}

process.exit(0)

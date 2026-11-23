/**
 * Uploads one extra photo (a scene) per colour of the Men Spray and puts it in the variant's
 * "More photos", replacing what was there. Files are read from GALLERY_DIR, named after the
 * colour: gold.png, copper.png, red.png, burgundy.png, rose.png (a colour without a file is left
 * as it is).
 * Run with: GALLERY_DIR=/path pnpm payload run src/scripts/set-variant-gallery.ts
 */
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import sharp from 'sharp'

const dir = process.env.GALLERY_DIR
if (!dir) throw new Error('Set GALLERY_DIR to the folder with the photos')

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'products',
  where: { slug: { equals: 'men-spray' } },
  limit: 1,
  depth: 0,
})
const product = docs[0]
if (!product) throw new Error('Men Spray not found')

const variants = []
for (const variant of product.variants ?? []) {
  const file = ['png', 'jpg', 'webp']
    .map((ext) => path.join(dir, `${variant.name.toLowerCase()}.${ext}`))
    .find((f) => fs.existsSync(f))
  if (!file) {
    variants.push(variant)
    continue
  }
  const data = await sharp(file)
    .resize({ height: 1500, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()
  const media = await payload.create({
    collection: 'media',
    data: {
      alt: `Say400 men spray: the ${[variant.strength, 'bottle'].filter(Boolean).join(' ')} and the ${variant.name} box with ginseng, acmella and ginkgo`,
    },
    file: {
      data,
      mimetype: 'image/webp',
      name: `say400-${variant.name.toLowerCase()}-botanical.webp`,
      size: data.length,
    },
  })
  variants.push({ ...variant, gallery: [media.id] })
  payload.logger.info(`${variant.name}: extra photo set`)
}

await payload.update({ collection: 'products', id: product.id, data: { variants } })

process.exit(0)

/**
 * Uploads the bottle + box photos and attaches each to its colour of the Men Spray.
 * Files are read from PHOTOS_DIR, named after the colour: gold.png, rose.png, copper.png, red.png,
 * burgundy.png (any colour without a file is left as it is). The Gold photo also becomes the main
 * product image, shown in the hero.
 * Run with: PHOTOS_DIR=/path pnpm payload run src/scripts/set-variant-photos.ts
 */
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import sharp from 'sharp'

const dir = process.env.PHOTOS_DIR
if (!dir) throw new Error('Set PHOTOS_DIR to the folder with the photos')

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'products',
  where: { slug: { equals: 'men-spray' } },
  limit: 1,
  depth: 0,
})
const product = docs[0]
if (!product) throw new Error('Men Spray not found')

const upload = async (file: string, alt: string) => {
  const data = await sharp(file).resize({ width: 1400 }).webp({ quality: 86 }).toBuffer()
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: 'image/webp',
      name: `say400-${path.basename(file, path.extname(file))}-bottle-box.webp`,
      size: data.length,
    },
  })
  return media.id
}

let heroImage: number | null = null
const variants = []
for (const variant of product.variants ?? []) {
  const file = ['png', 'jpg', 'webp']
    .map((ext) => path.join(dir, `${variant.name.toLowerCase()}.${ext}`))
    .find((f) => fs.existsSync(f))
  if (!file) {
    variants.push(variant)
    continue
  }
  const id = await upload(
    file,
    `Say400 men spray: black bottle with a gold ring next to the ${variant.name} box`,
  )
  if (variant.name.toLowerCase() === 'gold') heroImage = id
  variants.push({ ...variant, photo: id })
  payload.logger.info(`${variant.name}: photo set`)
}

await payload.update({
  collection: 'products',
  id: product.id,
  data: { variants, ...(heroImage && { images: [heroImage] }) },
})
payload.logger.info(heroImage ? 'Gold photo is the main product image' : 'No Gold photo')

process.exit(0)

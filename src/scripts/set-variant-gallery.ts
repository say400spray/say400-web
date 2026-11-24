/**
 * Uploads the extra photos of each colour of the Men Spray and puts them in the variant's
 * "More photos", replacing what was there. Files are read from GALLERY_DIR, named after the colour
 * and shown in name order: gold-1-ingredients.png, gold-2-hand.png, gold-3-boxes.jpg, … (a single
 * gold.png works too). A colour without files is left as it is.
 * With HIDE_BOX_SIDES=1, the colours that got photos stop showing the drawn box front and back in
 * the gallery (use it when the photos already show the box).
 * Run with: GALLERY_DIR=/path pnpm payload run src/scripts/set-variant-gallery.ts
 */
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import sharp from 'sharp'

const dir = process.env.GALLERY_DIR
if (!dir) throw new Error('Set GALLERY_DIR to the folder with the photos')
const hideBoxSides = process.env.HIDE_BOX_SIDES === '1'

// alt text from the word in the file name
const scenes: Record<string, string> = {
  botanical: 'with ginseng, acmella and ginkgo',
  ingredients: 'among its botanical ingredients: ginseng, acmella and ginkgo',
  hand: 'held in a man’s hand, pocket-size',
  boxes: 'box front and back: ingredients, how to use and precautions',
}

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'products',
  where: { slug: { equals: 'men-spray' } },
  limit: 1,
  depth: 0,
})
const product = docs[0]
if (!product) throw new Error('Men Spray not found')

const files = fs.readdirSync(dir).sort()
const variants = []
for (const variant of product.variants ?? []) {
  const colour = variant.name.toLowerCase()
  const mine = files.filter((f) => new RegExp(`^${colour}(-.*)?\\.(png|jpe?g|webp)$`, 'i').test(f))
  if (!mine.length) {
    variants.push(variant)
    continue
  }
  const ids = []
  for (const name of mine) {
    const data = await sharp(path.join(dir, name))
      // large enough to read the box print when the photo is enlarged
      .resize({ height: 2400, withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer()
    const scene = Object.keys(scenes).find((k) => name.includes(k))
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Say400 men spray, ${variant.name} ${variant.strength ?? ''}${scene ? `: ${scenes[scene]}` : ''}`.replace(/\s+/g, ' '),
      },
      file: {
        data,
        mimetype: 'image/webp',
        name: `say400-${path.basename(name, path.extname(name))}.webp`,
        size: data.length,
      },
    })
    ids.push(media.id)
  }
  variants.push({ ...variant, gallery: ids, ...(hideBoxSides && { showBoxSides: false }) })
  payload.logger.info(`${variant.name}: ${ids.length} photo(s) set`)
}

await payload.update({ collection: 'products', id: product.id, data: { variants } })

process.exit(0)

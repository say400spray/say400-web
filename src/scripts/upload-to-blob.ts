/**
 * One-off: copies the files already uploaded on this machine (/media, /videos) to Vercel Blob,
 * under the same names the storage plugin uses, so existing images and videos keep working
 * once BLOB_READ_WRITE_TOKEN is set. Safe to run again (files are overwritten, not duplicated).
 *
 * usage: BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... pnpm payload run src/scripts/upload-to-blob.ts
 */
import config from '@payload-config'
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  console.error('Set BLOB_READ_WRITE_TOKEN first.')
  process.exit(1)
}

const payload = await getPayload({ config })

// collection, folder on disk, prefix in Blob (as in payload.config.ts)
const sources = [
  { collection: 'media', dir: 'media', prefix: 'media' },
  { collection: 'videos', dir: 'videos', prefix: 'videos' },
] as const

let uploaded = 0
let missing = 0
for (const { collection, dir, prefix } of sources) {
  const { docs } = await payload.find({ collection, limit: 1000, depth: 0, pagination: false })
  for (const doc of docs) {
    if (!doc.filename) continue // a video given as a link only
    const file = path.resolve(process.cwd(), dir, doc.filename)
    if (!fs.existsSync(file)) {
      console.warn(`missing on disk: ${dir}/${doc.filename}`)
      missing++
      continue
    }
    const { url } = await put(`${doc.prefix || prefix}/${doc.filename}`, fs.readFileSync(file), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: doc.mimeType ?? undefined,
      token,
    })
    console.log(`${collection}: ${doc.filename} -> ${url}`)
    uploaded++
  }
}

console.log(`Done: ${uploaded} uploaded, ${missing} missing.`)
process.exit(0)

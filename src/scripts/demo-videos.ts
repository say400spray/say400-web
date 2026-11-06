/**
 * Temporary demo videos to preview the landing page video section.
 * Run with: pnpm payload run src/scripts/demo-videos.ts <folder with demo-*.mp4>
 * Delete them in the admin (Content → Videos) once the real videos are uploaded.
 */
import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

const folder = process.argv.slice(2).find((a) => !a.endsWith('.ts'))
if (!folder) throw new Error('Pass the folder that contains the demo videos')

const demos = [
  { file: 'demo-featured.mp4', title: 'Meet Say400', caption: 'Demo video: replace in the admin', orientation: 'landscape', featured: true, order: 0 },
  { file: 'demo-1.mp4', title: 'Discreet by design', caption: 'Plain box, nothing on the label', orientation: 'portrait', order: 1 },
  { file: 'demo-2.mp4', title: 'Natural formula', caption: 'Acmella, damiana, ginkgo & ginseng', orientation: 'portrait', order: 2 },
  { file: 'demo-3.mp4', title: 'Confidence, on demand', caption: 'Pocket-size, always with you', orientation: 'portrait', order: 3 },
] as const

const payload = await getPayload({ config })

for (const demo of demos) {
  const { totalDocs } = await payload.count({ collection: 'videos', where: { title: { equals: demo.title } } })
  if (totalDocs > 0) continue
  const { file, ...data } = demo
  await payload.create({
    collection: 'videos',
    data: { ...data, featured: 'featured' in data ? data.featured : false, active: true },
    filePath: path.resolve(folder, file),
  })
  payload.logger.info(`Created demo video "${demo.title}"`)
}

// a link-only video, to preview how YouTube links are shown (the id is a placeholder)
const { totalDocs } = await payload.count({ collection: 'videos', where: { title: { equals: 'Watch on YouTube' } } })
if (!totalDocs) {
  await payload.create({
    collection: 'videos',
    data: {
      title: 'Watch on YouTube',
      caption: 'Demo link: replace with a real video',
      externalUrl: 'https://youtu.be/demoVideo01',
      orientation: 'portrait',
      order: 4,
      active: true,
    },
  })
  payload.logger.info('Created demo link video')
}

process.exit(0)

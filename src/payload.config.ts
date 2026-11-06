import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Customers } from './collections/Customers'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { Reviews } from './collections/Reviews'
import { SampleRequests } from './collections/SampleRequests'
import { Users } from './collections/Users'
import { Videos } from './collections/Videos'
import { cancelUnpaidOrdersTask } from './jobs/cancelUnpaidOrders'
import { sampleReviewEmailTask } from './jobs/sampleReviewEmail'
import { CompanyInfo } from './globals/CompanyInfo'
import { Faq } from './globals/Faq'
import { ShopSettings } from './globals/ShopSettings'
import { refreshesCollection, refreshesGlobal, SAMPLES_TAG } from './lib/cms'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Vercel's Neon integration names it SAY400_STORAGE_DATABASE_URL (pooled connection)
const databaseUrl = process.env.DATABASE_URL || process.env.SAY400_STORAGE_DATABASE_URL || ''
const isLocalDatabase = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(databaseUrl)

export default buildConfig({
  serverURL: process.env.SITE_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // content shown on the site is cached; saving it in the admin refreshes the site right away
  collections: [
    Orders,
    refreshesCollection(SampleRequests, SAMPLES_TAG),
    Customers,
    ...[Products, Reviews, Videos, Pages, Media].map((c) => refreshesCollection(c)),
    Users,
  ],
  globals: [ShopSettings, CompanyInfo, Faq].map(refreshesGlobal),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: databaseUrl },
    // dev mode syncs the schema straight into the database; only ever do that on this machine's
    // database. Neon (production) changes only through migrations (src/migrations).
    push: isLocalDatabase,
  }),
  sharp,
  jobs: {
    tasks: [cancelUnpaidOrdersTask, sampleReviewEmailTask],
    // runs the scheduled tasks inside the server process (needs a long-running server, e.g. `next start`;
    // on serverless hosting call /api/payload-jobs/run from a cron instead)
    autoRun: [{ cron: '0 * * * * *', queue: 'maintenance' }],
    shouldAutoRun: () => process.env.DISABLE_JOBS !== 'true',
  },
  plugins: [
    // images and videos go to Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production);
    // without it (local development) they stay in /media and /videos on disk
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // same database columns with or without the token
      alwaysInsertFields: true,
      collections: {
        // public files: served straight from the Blob CDN instead of through the server
        media: { prefix: 'media', disablePayloadAccessControl: true },
        videos: { prefix: 'videos', disablePayloadAccessControl: true },
      },
      // the browser uploads straight to Blob, so videos can be bigger than Vercel's 4.5 MB request limit
      clientUploads: { access: ({ req }) => req.user?.collection === 'users' },
    }),
  ],
})

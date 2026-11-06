import { postgresAdapter } from '@payloadcms/db-postgres'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.SITE_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Orders, SampleRequests, Customers, Products, Reviews, Videos, Pages, Media, Users],
  globals: [ShopSettings, CompanyInfo, Faq],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  jobs: {
    tasks: [cancelUnpaidOrdersTask, sampleReviewEmailTask],
    // runs the scheduled tasks inside the server process (needs a long-running server, e.g. `next start`;
    // on serverless hosting call /api/payload-jobs/run from a cron instead)
    autoRun: [{ cron: '0 * * * * *', queue: 'maintenance' }],
    shouldAutoRun: () => process.env.DISABLE_JOBS !== 'true',
  },
  plugins: [],
})

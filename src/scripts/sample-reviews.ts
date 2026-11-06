/**
 * Sample reviews so the client can see the reviews section on the private preview.
 * They are marked "sample": shown, labelled, only while PREVIEW_PASSWORD is set, and never
 * on the public site. Delete them in the admin once real customer reviews arrive.
 * Run with: pnpm payload run src/scripts/sample-reviews.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const samples = [
  {
    name: 'James T.',
    variant: 'Gold',
    country: 'United Kingdom',
    rating: 5,
    text: 'Arrived in two days in a plain box. Easy to use, and the Gold box was a good place to start.',
  },
  {
    name: 'Lukas M.',
    variant: 'Gold',
    country: 'Germany',
    rating: 5,
    text: 'Ordered to Germany and could track it all the way. Nothing on the parcel says what is inside.',
  },
  {
    name: 'Daniel R.',
    variant: 'Copper',
    country: 'Ireland',
    rating: 5,
    text: 'Started with Gentle and moved up to Plus. Good to have a choice of strengths.',
  },
  {
    name: 'Marco B.',
    variant: 'Rose',
    country: 'Italy',
    rating: 4,
    text: 'Quality bottle with a fine, even spray. Customer service answered my question within hours.',
  },
  {
    name: 'Tom H.',
    variant: 'Gold',
    country: 'United Kingdom',
    rating: 5,
    text: 'Exactly as described. The 12 ml on my first order was great value.',
  },
  {
    name: 'Pieter V.',
    variant: 'Copper',
    country: 'Netherlands',
    rating: 4,
    text: 'Simple and discreet. Going to try Intense next time.',
  },
]

const payload = await getPayload({ config })

const { totalDocs } = await payload.count({
  collection: 'reviews',
  where: { sample: { equals: true } },
})
if (totalDocs > 0) {
  payload.logger.info('Sample reviews already exist')
} else {
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'men-spray' } },
    limit: 1,
    depth: 0,
  })
  for (const review of samples) {
    await payload.create({
      collection: 'reviews',
      data: { ...review, product: docs[0]?.id, approved: true, sample: true },
    })
  }
  payload.logger.info(`Added ${samples.length} sample reviews (private preview only)`)
}

process.exit(0)

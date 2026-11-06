import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'
import { BackLink } from '../../components/BackLink'
import { CompanyDetails } from '../../components/CompanyDetails'

export const dynamic = 'force-dynamic'

const LEGAL_DESCRIPTIONS: Record<string, string> = {
  shipping:
    'Delivery times and costs for Say400 Men Spray: tracked shipping from the UK to the UK and the EU, in plain packaging.',
  returns:
    'How to return Say400 products: 14-day returns on unopened products, and how refunds work.',
  terms: 'Terms and conditions for buying from the Say400 online shop.',
  privacy: 'How Say400 collects, uses and protects your personal data.',
  cookies: 'Which cookies the Say400 website uses and how to change your choice.',
}

// listed under "Help" in the footer
const HELP_PAGES = ['shipping', 'returns']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    select: { title: true },
  })
  if (!docs[0]) return {}
  return pageMeta(
    docs[0].title,
    LEGAL_DESCRIPTIONS[slug] ?? `${docs[0].title} for the Say400 online shop.`,
    `/legal/${slug}`,
  )
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const page = docs[0]
  if (!page) notFound()

  return (
    <section className="container section legal">
      <BackLink />
      <p className="eyebrow">{HELP_PAGES.includes(slug) ? 'Help' : 'Legal'}</p>
      <h1>{page.title}</h1>
      <p className="muted small">
        Last updated {new Date(page.updatedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}
      </p>
      <RichText className="prose" data={page.content} />
      <CompanyDetails />
    </section>
  )
}

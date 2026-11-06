import type { BasePayload } from 'payload'

export type SocialLink = { name: string; url: string }

export type SampleCampaign = {
  limit: number
  /** samples still free to request */
  remaining: number
  sampleLabel: string
  socials: SocialLink[]
}

/** The free sample campaign, or null while it is switched off in the shop settings. */
export async function getSampleCampaign(payload: BasePayload): Promise<SampleCampaign | null> {
  const settings = await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  const s = settings.freeSamples
  if (!s?.enabled) return null

  const limit = s.limit ?? 500
  // rejected requests give their sample back
  const { totalDocs: taken } = await payload.count({
    collection: 'sample-requests',
    where: { status: { not_equals: 'rejected' } },
  })
  const socials = (
    [
      ['Instagram', s.instagram],
      ['TikTok', s.tiktok],
      ['Facebook', s.facebook],
      ['Telegram', s.telegram],
    ] as const
  )
    .filter(([, url]) => url && /^https?:\/\//.test(url))
    .map(([name, url]) => ({ name, url: url! }))

  return {
    limit,
    remaining: Math.max(limit - taken, 0),
    sampleLabel: s.sampleLabel || 'sample bottle',
    socials,
  }
}

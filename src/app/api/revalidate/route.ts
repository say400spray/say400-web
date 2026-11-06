import { createHash, timingSafeEqual } from 'crypto'

import { CONTENT_TAG, refreshContent, SAMPLES_TAG } from '@/lib/cms'

export const dynamic = 'force-dynamic'

/** The token is derived from PAYLOAD_SECRET, so the secret itself never appears in a URL. */
function expectedToken(): string | null {
  const secret = process.env.PAYLOAD_SECRET
  return secret ? createHash('sha256').update(`revalidate:${secret}`).digest('hex') : null
}

/**
 * GET /api/revalidate?token=… clears the cached content, for changes made outside the admin
 * (scripts run against the database). Saving in the admin already does this by itself.
 * Token: sha256 of "revalidate:" + PAYLOAD_SECRET, in hex.
 */
export function GET(request: Request) {
  const expected = expectedToken()
  const given = new URL(request.url).searchParams.get('token') ?? ''
  const ok =
    expected !== null &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  if (!ok) return Response.json({ error: 'Not allowed' }, { status: 401 })

  refreshContent(CONTENT_TAG)
  refreshContent(SAMPLES_TAG)
  return Response.json({ revalidated: true })
}

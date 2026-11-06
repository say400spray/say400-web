import type { Where } from 'payload'

import type { Review } from '../payload-types'
import { previewPassword } from './previewAccess'

/**
 * Reviews visitors may see: approved ones, plus sample reviews while the site is a
 * password-protected preview. Sample reviews never reach the public site.
 */
export const visibleReviewsWhere = (extra: Where = {}): Where => ({
  and: [
    { approved: { equals: true } },
    ...(previewPassword() ? [] : [{ sample: { not_equals: true } }]),
    extra,
  ],
})

/** Average and count of genuine reviews only; samples never count towards the rating. */
export function ratingSummary(reviews: Pick<Review, 'rating' | 'sample'>[]) {
  const real = reviews.filter((r) => !r.sample)
  const average = real.length ? real.reduce((sum, r) => sum + r.rating, 0) / real.length : 0
  return { average, count: real.length }
}

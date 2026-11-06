import type { TaskConfig } from 'payload'

import { sendSampleReviewEmail } from '../lib/email'

/**
 * Queued when a free sample is marked "Sent", to run a few days later: asks for an honest
 * review, unless the customer already left one (or the request was changed since).
 */
export const sampleReviewEmailTask: TaskConfig<{
  input: { request: number }
  output: { sent: boolean }
}> = {
  slug: 'sampleReviewEmail',
  inputSchema: [{ name: 'request', type: 'number', required: true }],
  retries: 2,
  handler: async ({ input, req }) => {
    const request = await req.payload.findByID({
      collection: 'sample-requests',
      id: input.request,
      depth: 0,
      disableErrors: true,
      req,
    })
    if (!request || request.status !== 'sent' || request.review || request.reviewEmailSentAt) {
      return { output: { sent: false } }
    }
    await sendSampleReviewEmail(request)
    await req.payload.update({
      collection: 'sample-requests',
      id: request.id,
      data: { reviewEmailSentAt: new Date().toISOString() },
      req,
    })
    return { output: { sent: true } }
  },
}

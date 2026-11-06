import Link from 'next/link'

import { addressLines } from '@/lib/countries'
import { getCurrentCustomer, getPayloadClient, hasShippingAddress } from '@/lib/payload'
import { getSampleCampaign } from '@/lib/samples'
import { pageMeta } from '@/lib/seo'
import { requestSampleAction, sampleReviewAction } from '../actions'
import { ActionForm } from '../components/Forms'

export const dynamic = 'force-dynamic'

export const metadata = pageMeta(
  'Free sample',
  'Try Say400 Men Spray for free: a 5 ml sample for the first customers, delivered in plain packaging to the UK and the EU. Adults 18+.',
  '/free-sample',
)

const HERE = '/free-sample'

/** Star picker made of radio buttons, so it works without JavaScript. */
function RatingInput() {
  return (
    <fieldset className="rating-input">
      <legend>Your rating</legend>
      <div>
        {[5, 4, 3, 2, 1].map((n) => (
          <label key={n} title={`${n} star${n > 1 ? 's' : ''}`}>
            <input name="rating" required type="radio" value={n} />
            <span aria-hidden>★</span>
            <span className="sr-only">
              {n} star{n > 1 ? 's' : ''}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default async function FreeSamplePage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string; reviewed?: string }>
}) {
  const { requested, reviewed } = await searchParams
  const payload = await getPayloadClient()
  const [campaign, customer] = await Promise.all([getSampleCampaign(payload), getCurrentCustomer()])
  const request = customer
    ? (
        await payload.find({
          collection: 'sample-requests',
          where: { customer: { equals: customer.id } },
          limit: 1,
          depth: 0,
        })
      ).docs[0]
    : undefined

  // the campaign may be over, but people who got a sample can still follow up
  if (!campaign && !request) {
    return (
      <section className="container section narrow sample-page">
        <p className="eyebrow">Free sample</p>
        <h1>Not running right now</h1>
        <p className="muted">
          The free sample campaign is closed at the moment. Keep an eye on our socials for the next
          one.
        </p>
        <Link className="btn btn-primary" href="/#product">
          Shop Men Spray
        </Link>
      </section>
    )
  }

  const taken = campaign ? campaign.limit - campaign.remaining : 0
  const label = campaign?.sampleLabel ?? 'sample'

  return (
    <section className="container section narrow-wide sample-page">
      <header className="sample-head">
        <p className="eyebrow">Free sample</p>
        <h1>
          Try it free. <span className="gold-text">Tell us honestly.</span>
        </h1>
        {campaign && (
          <>
            <p className="lead">
              We are sending a free {label} to the first {campaign.limit} people. Try it at your own
              pace, then share your honest review, good or bad.
            </p>
            <div
              className="sample-meter"
              aria-label={`${campaign.remaining} of ${campaign.limit} left`}
            >
              <span style={{ width: `${(taken / campaign.limit) * 100}%` }} />
            </div>
            <p className="sample-meter-label">
              <strong>{campaign.remaining}</strong> of {campaign.limit} left
            </p>
          </>
        )}
      </header>

      {campaign && !request && (
        <ol className="steps sample-steps">
          <li>
            <span className="step-number">01</span>
            <h3>Follow us</h3>
            <p>
              Follow Say400 and join our Telegram group, so you hear about new boxes and offers
              first.
            </p>
            {campaign.socials.length > 0 && (
              <p className="sample-socials">
                {campaign.socials.map((s) => (
                  <a href={s.url} key={s.name} rel="noopener noreferrer" target="_blank">
                    {s.name}
                  </a>
                ))}
              </p>
            )}
          </li>
          <li>
            <span className="step-number">02</span>
            <h3>Ask for your sample</h3>
            <p>One per person. Posted from the UK in plain packaging, free to the UK and the EU.</p>
          </li>
          <li>
            <span className="step-number">03</span>
            <h3>Leave your review</h3>
            <p>Once you have tried it, tell us what you think. We will email you a reminder.</p>
          </li>
        </ol>
      )}

      <div className="card sample-card">
        {request ? (
          request.status === 'requested' ? (
            <>
              {requested && <p className="alert alert-success">Thank you, your request is in.</p>}
              <h2>Your sample is reserved</h2>
              <p className="muted">
                We will post it to {request.shippingAddress.line1}, {request.shippingAddress.city}{' '}
                soon. A few days after it arrives we will email you to ask how you found it.
              </p>
            </>
          ) : request.status === 'sent' ? (
            <div id="review">
              <h2>How did you find it?</h2>
              <p className="muted">
                Your honest opinion helps other customers decide, whatever it is. Your review is
                shown with a &ldquo;Free sample&rdquo; label once we have checked it.
              </p>
              <ActionForm action={sampleReviewAction} submitLabel="Send my review">
                <RatingInput />
                <label>
                  Your review
                  <textarea
                    maxLength={1500}
                    minLength={20}
                    name="text"
                    placeholder="What did you like, what could be better?"
                    required
                    rows={5}
                  />
                </label>
                <p className="muted small">
                  Shown as {customer!.firstName} {customer!.lastName.charAt(0)}. with your country.
                </p>
              </ActionForm>
            </div>
          ) : request.status === 'reviewed' ? (
            <>
              {reviewed && <p className="alert alert-success">Your review has been sent.</p>}
              <h2>Thank you for your review</h2>
              <p className="muted">It appears on the site once we have checked it.</p>
            </>
          ) : (
            <>
              <h2>We could not send this sample</h2>
              <p className="muted">If you think this is a mistake, please get in touch with us.</p>
            </>
          )
        ) : !campaign ? null : campaign.remaining <= 0 ? (
          <>
            <h2>All samples have been claimed</h2>
            <p className="muted">Thank you to everyone who asked. Keep an eye on our socials.</p>
          </>
        ) : !customer ? (
          <>
            <h2>Ask for your free sample</h2>
            <p className="muted">Create an account so we know where to post it. Adults 18+ only.</p>
            <div className="sample-actions">
              <Link className="btn btn-primary" href={`/register?next=${encodeURIComponent(HERE)}`}>
                Create an account
              </Link>
              <Link className="text-link" href={`/login?next=${encodeURIComponent(HERE)}`}>
                I already have one
              </Link>
            </div>
          </>
        ) : !hasShippingAddress(customer) ? (
          <>
            <h2>Where should we post it?</h2>
            <p className="muted">Add your delivery address first, then come back here.</p>
            <Link className="btn btn-primary" href={`/account?next=${encodeURIComponent(HERE)}`}>
              Add my address
            </Link>
          </>
        ) : (
          <>
            <h2>Ask for your free sample</h2>
            <ActionForm action={requestSampleAction} submitLabel="Send me my free sample">
              <div className="sample-address">
                <span className="muted small">Posted to</span>
                <p>
                  {customer.firstName} {customer.lastName}
                  <br />
                  {addressLines(customer.shipping!).join(', ')}
                </p>
                <Link
                  className="text-link small"
                  href={`/account?next=${encodeURIComponent(HERE)}`}
                >
                  Change
                </Link>
              </div>
              <p className="muted small">
                Your usernames, so we can say thanks for following (only seen by our team):
              </p>
              <div className="row">
                <label>
                  Instagram
                  <input name="instagram" placeholder="@username" />
                </label>
                <label>
                  TikTok
                  <input name="tiktok" placeholder="@username" />
                </label>
              </div>
              <div className="row">
                <label>
                  Facebook
                  <input name="facebook" placeholder="Your name or profile link" />
                </label>
                <label>
                  Telegram
                  <input name="telegram" placeholder="@username" />
                </label>
              </div>
              <label className="checkbox">
                <input name="honest" required type="checkbox" />
                <span>I will try it and share my honest opinion, good or bad.</span>
              </label>
            </ActionForm>
          </>
        )}
      </div>

      <p className="muted small sample-fine">
        One free sample per person, while they last. Adults 18+ only, delivery to the UK and the EU.
        Your review never has to be positive, and it is shown with a &ldquo;Free sample&rdquo;
        label.
      </p>
    </section>
  )
}

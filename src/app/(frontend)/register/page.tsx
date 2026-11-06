import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getFirstOrderOffer } from '@/lib/offer'
import { getCurrentCustomer, getPayloadClient } from '@/lib/payload'
import { safePath } from '@/lib/site'
import { registerAction } from '../actions'
import { ActionForm } from '../components/Forms'
import { PrefillEmail } from '../components/PrefillEmail'
import { privatePage } from '@/lib/seo'

export const metadata = privatePage('Create an account')

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next = '' } = await searchParams
  if (await getCurrentCustomer()) redirect(safePath(next, '/account'))
  const offer = await getFirstOrderOffer(await getPayloadClient())

  return (
    <section className="container section narrow">
      <h1>Create an account</h1>
      {offer?.kind === 'percent' && (
        <p className="offer-note offer-note-block">
          <span aria-hidden className="offer-note-badge">
            −{offer.percent}%
          </span>
          {offer.badge}. Applied automatically at checkout.
        </p>
      )}
      {/* email left in the welcome pop-up */}
      <PrefillEmail />
      <ActionForm action={registerAction} submitLabel="Create account">
        <input name="next" type="hidden" value={next} />
        <div className="row">
          <label>
            First name
            <input autoComplete="given-name" name="firstName" required />
          </label>
          <label>
            Last name
            <input autoComplete="family-name" name="lastName" required />
          </label>
        </div>
        <label>
          Email
          <input autoComplete="email" name="email" required type="email" />
        </label>
        <label>
          Password
          <input
            autoComplete="new-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        <label className="checkbox">
          <input name="adult" required type="checkbox" />
          <span>I confirm I am 18 years of age or older.</span>
        </label>
        <label className="checkbox">
          <input name="marketing" type="checkbox" />
          <span>
            Send me exclusive offers and discounts by email. You can unsubscribe at any time.
          </span>
        </label>
        <p className="muted small legal-note">
          By creating an account you agree to our{' '}
          <Link href="/legal/terms">Terms &amp; Conditions</Link>. We use your data as described in
          our <Link href="/legal/privacy">Privacy Policy</Link>.
        </p>
      </ActionForm>
      <p className="muted">
        Already have an account?{' '}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Log in</Link>
      </p>
    </section>
  )
}

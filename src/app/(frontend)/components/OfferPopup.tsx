'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { Bottle } from './Bottle'
import { OFFER_EMAIL_KEY } from './PrefillEmail'

const SEEN_KEY = 'first_order_offer_seen'
// long enough that the visitor has looked around first
const DELAY_MS = 90_000
// pages where a pop-up would get in the way of finishing something
const QUIET = ['/checkout', '/payment', '/account', '/login', '/register', '/legal']

/** The title with its "20% off" part in gold, when the title contains it. */
function Headline({ title, highlight }: { title: string; highlight: string }) {
  const at = title.toLowerCase().indexOf(highlight.toLowerCase())
  if (at < 0) return <>{title}</>
  return (
    <>
      {title.slice(0, at)}
      <span className="offer-headline-gold">{title.slice(at, at + highlight.length)}</span>
      {title.slice(at + highlight.length)}
    </>
  )
}

/**
 * Welcome pop-up for the first-order offer. Shown once per browser, after about a minute and a
 * half on the site, and never on top of the cookie banner. Visitors leave their email and
 * continue to account creation with it filled in.
 */
export function OfferPopup({
  kind,
  percent,
  title,
  text,
  badge,
  loggedIn,
}: {
  kind: 'percent' | 'size'
  percent: number
  title: string
  text: string
  badge: string
  /** visitors are asked to create an account; customers go straight to the product */
  loggedIn: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (QUIET.some((p) => pathname.startsWith(p))) return
    try {
      if (localStorage.getItem(SEEN_KEY)) return
    } catch {
      return
    }

    const timer = setInterval(() => {
      // wait for the age check and the cookie choice first; try again a little later
      if (document.querySelector('.cookie-banner, .age-gate[open]') || dialog.current?.open) return
      clearInterval(timer)
      try {
        localStorage.setItem(SEEN_KEY, '1')
      } catch {}
      dialog.current?.showModal()
    }, DELAY_MS)
    return () => clearInterval(timer)
  }, [pathname])

  const close = () => dialog.current?.close()
  const tag = kind === 'percent' ? `${percent}% off` : badge

  return (
    <dialog
      aria-labelledby="offer-title"
      className="offer-dialog"
      onClick={(e) => e.target === dialog.current && close()}
      ref={dialog}
    >
      <div className="offer-inner">
        <button aria-label="Close" className="offer-close" onClick={close} type="button" />

        <div aria-hidden className="offer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" height={52} src="/brand/logo.svg" width={140} />
          <span className="offer-pill">{tag}</span>
        </div>

        {kind === 'size' && (
          <div aria-hidden className="offer-visual">
            <div className="offer-bottle is-small">
              <Bottle />
              <span>6 ml</span>
            </div>
            <span className="offer-arrow" />
            <div className="offer-bottle">
              <Bottle />
              <span>12 ml</span>
            </div>
          </div>
        )}

        <h2 className="offer-headline" id="offer-title">
          <Headline highlight={tag} title={title} />
        </h2>
        <p className="offer-text">{text}</p>

        {loggedIn ? (
          <Link className="offer-cta" href="/#product" onClick={close}>
            Shop now
          </Link>
        ) : (
          <form
            action="/register"
            className="offer-form"
            onSubmit={(e) => {
              // the email travels in this tab's storage, never in the URL (history, server logs)
              e.preventDefault()
              const email = new FormData(e.currentTarget).get('email')
              try {
                sessionStorage.setItem(OFFER_EMAIL_KEY, String(email ?? ''))
              } catch {}
              close()
              router.push('/register?next=/%23product')
            }}
          >
            <input
              aria-label="Your email"
              autoComplete="email"
              className="offer-email"
              name="email"
              placeholder="you@email.com"
              required
              type="email"
            />
            <button className="offer-cta" type="submit">
              {kind === 'percent' ? `Get my ${percent}% off` : 'Claim my offer'}
            </button>
          </form>
        )}

        <button className="offer-dismiss" onClick={close} type="button">
          Maybe later
        </button>
        <p className="offer-fine">
          One welcome offer per customer, on the first order. Adults 18+ only.
        </p>
      </div>
    </dialog>
  )
}

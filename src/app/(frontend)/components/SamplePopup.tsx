'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { Bottle } from './Bottle'

const SEEN_KEY = 'free_sample_popup_seen'
// long enough that the visitor has looked around first
const DELAY_MS = 90_000
// pages where a pop-up would get in the way of finishing something
const QUIET = ['/checkout', '/payment', '/account', '/login', '/register', '/legal', '/free-sample']

/**
 * Pop-up for the free sample campaign, for visitors who have not asked for one yet.
 * Shown once per browser after about a minute and a half, never on top of the cookie banner.
 * The numbers are the real ones from the campaign, so the urgency is never made up.
 */
export function SamplePopup({
  remaining,
  limit,
  sampleLabel,
}: {
  remaining: number
  limit: number
  sampleLabel: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()

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
  const taken = limit - remaining

  return (
    <dialog
      aria-labelledby="sample-popup-title"
      className="offer-dialog"
      onClick={(e) => e.target === dialog.current && close()}
      ref={dialog}
    >
      <div className="offer-inner">
        <button aria-label="Close" className="offer-close" onClick={close} type="button" />

        <div aria-hidden className="offer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" height={52} src="/brand/logo.svg" width={140} />
          <span className="offer-pill">Free sample</span>
        </div>

        <div aria-hidden className="offer-visual sample-popup-visual">
          <div className="offer-bottle">
            <Bottle />
            <span>{sampleLabel}</span>
          </div>
        </div>

        <h2 className="offer-headline" id="sample-popup-title">
          Try it free. <span className="offer-headline-gold">On us.</span>
        </h2>
        <p className="offer-text">
          We are giving away {limit} free {sampleLabel}s. Once they are gone, they are gone, so grab
          yours now and tell us honestly what you think.
        </p>

        <div aria-label={`${remaining} of ${limit} left`} className="sample-meter">
          <span style={{ width: `${(taken / limit) * 100}%` }} />
        </div>
        <p className="sample-meter-label">
          Only <strong>{remaining}</strong> of {limit} left
        </p>

        <Link className="offer-cta" href="/free-sample" onClick={close}>
          Claim my free sample
        </Link>
        <button className="offer-dismiss" onClick={close} type="button">
          Maybe later
        </button>
        <p className="offer-fine">
          One per person, while they last. Adults 18+ only, UK &amp; EU delivery.
        </p>
      </div>
    </dialog>
  )
}

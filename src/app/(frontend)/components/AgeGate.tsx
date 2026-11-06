'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AGE_KEY, AGE_PENDING } from '@/lib/ageCheck'

// the legal pages stay readable, so visitors can check them before confirming
const OPEN_PAGES = ['/legal']

/** Whether this browser has confirmed the visitor is 18+ (other pop-ups wait for it). */
export function ageConfirmed(): boolean {
  try {
    return localStorage.getItem(AGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * "Are you 18 or over?" on the first visit. The answer is kept in this browser only
 * (strictly necessary storage, no consent needed). Saying no shows a short notice
 * and a way out; the site stays hidden behind the dialog.
 */
export function AgeGate() {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()
  const [refused, setRefused] = useState(false)

  useEffect(() => {
    if (ageConfirmed()) return
    if (OPEN_PAGES.some((p) => pathname.startsWith(p))) dialog.current?.close()
    else if (!dialog.current?.open) dialog.current?.showModal()
    // the dialog's own backdrop takes over from the cover painted before the page (AGE_COVER_SCRIPT)
    document.documentElement.classList.remove(AGE_PENDING)
  }, [pathname])

  const confirm = () => {
    try {
      localStorage.setItem(AGE_KEY, '1')
    } catch {}
    dialog.current?.close()
  }

  return (
    <dialog
      aria-labelledby="age-title"
      className="offer-dialog age-gate"
      // no escaping with the Esc key: an answer is needed
      onCancel={(e) => e.preventDefault()}
      ref={dialog}
    >
      <div className="offer-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Say400" className="age-logo" height={52} src="/brand/logo.svg" width={140} />
        <span aria-hidden className="age-badge">
          18+
        </span>

        {refused ? (
          <>
            <h2 className="offer-headline" id="age-title">
              Sorry, adults only
            </h2>
            <p className="offer-text">
              This website sells intimate products and is only for people aged 18 or over.
            </p>
            <a className="offer-cta" href="https://www.google.com" rel="noopener noreferrer">
              Leave this site
            </a>
            <button className="offer-dismiss" onClick={() => setRefused(false)} type="button">
              I pressed the wrong button
            </button>
          </>
        ) : (
          <>
            <h2 className="offer-headline" id="age-title">
              Are you <span className="offer-headline-gold">18 or over?</span>
            </h2>
            <p className="offer-text">
              This website sells intimate products for adults. Please confirm your age to continue.
            </p>
            <div className="age-actions">
              <button className="offer-cta" onClick={confirm} type="button">
                Yes, I am 18+
              </button>
              <button className="age-no" onClick={() => setRefused(true)} type="button">
                No, I am under 18
              </button>
            </div>
          </>
        )}

        <p className="offer-fine">
          By entering you agree to our <Link href="/legal/terms">Terms</Link> and{' '}
          <Link href="/legal/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </dialog>
  )
}

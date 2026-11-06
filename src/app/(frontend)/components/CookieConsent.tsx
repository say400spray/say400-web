'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { OPEN_SETTINGS_EVENT, readConsent, saveConsent } from '@/lib/consent'

/**
 * Cookie banner (UK PECR / EU ePrivacy): nothing optional runs before a choice,
 * "Reject all" is as prominent as "Accept all", and choices can be changed later.
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [customise, setCustomise] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const existing = readConsent()
    if (!existing) setOpen(true)

    const openSettings = () => {
      const current = readConsent()
      setAnalytics(current?.analytics ?? false)
      setMarketing(current?.marketing ?? false)
      setCustomise(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings)
  }, [])

  const choose = (choice: { analytics: boolean; marketing: boolean }) => {
    saveConsent(choice)
    setOpen(false)
    setCustomise(false)
  }

  if (!open) return null

  return (
    <div aria-label="Cookie consent" aria-modal="false" className="cookie-banner" role="dialog">
      <div className="cookie-inner">
        <div className="cookie-text">
          <p className="cookie-title">Your privacy</p>
          <p>
            We use essential cookies to run this site. With your permission we would also like to
            use analytics and marketing cookies. See our{' '}
            <Link href="/legal/cookies">Cookie Policy</Link>.
          </p>
        </div>

        {customise && (
          <div className="cookie-options">
            <label className="cookie-option">
              <input checked disabled type="checkbox" />
              <span>
                <strong>Essential</strong>
                <small>Login and security. Always on.</small>
              </span>
            </label>
            <label className="cookie-option">
              <input
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>Analytics</strong>
                <small>Helps us understand how the site is used.</small>
              </span>
            </label>
            <label className="cookie-option">
              <input
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>Marketing</strong>
                <small>Measures and personalises our ads.</small>
              </span>
            </label>
          </div>
        )}

        <div className="cookie-actions">
          <button
            className="btn btn-ghost btn-small"
            onClick={() => choose({ analytics: false, marketing: false })}
            type="button"
          >
            Reject all
          </button>
          {customise ? (
            <button
              className="btn btn-ghost btn-small"
              onClick={() => choose({ analytics, marketing })}
              type="button"
            >
              Save choices
            </button>
          ) : (
            <button
              className="btn btn-ghost btn-small"
              onClick={() => setCustomise(true)}
              type="button"
            >
              Customise
            </button>
          )}
          <button
            className="btn btn-ghost btn-small"
            onClick={() => choose({ analytics: true, marketing: true })}
            type="button"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}

/** Footer link that reopens the banner. */
export function CookieSettingsButton() {
  return (
    <button
      className="footer-link link-button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
      type="button"
    >
      Cookie settings
    </button>
  )
}

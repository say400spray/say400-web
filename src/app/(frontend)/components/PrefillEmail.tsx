'use client'

import { useEffect } from 'react'

export const OFFER_EMAIL_KEY = 'offer_email'

/** Fills the register form's email with the one left in the welcome pop-up, then forgets it. */
export function PrefillEmail() {
  useEffect(() => {
    try {
      const email = sessionStorage.getItem(OFFER_EMAIL_KEY)
      sessionStorage.removeItem(OFFER_EMAIL_KEY)
      const input = document.querySelector<HTMLInputElement>('form input[name="email"]')
      if (email && input && !input.value) input.value = email
    } catch {}
  }, [])
  return null
}

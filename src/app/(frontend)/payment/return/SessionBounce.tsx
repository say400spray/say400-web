'use client'

import { useEffect } from 'react'

/**
 * Browsers often drop the SameSite=Lax session cookie on the cross-site redirect back
 * from the payment provider. Reloading once from our own origin sends it again.
 */
export function SessionBounce({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href)
  }, [href])

  return (
    <section className="container section narrow">
      <p className="muted">Loading your order…</p>
    </section>
  )
}

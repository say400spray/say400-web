'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const CURRENT = 'nav_current'
const PREVIOUS = 'nav_previous'

/**
 * Remembers, per tab, the page of this site visited before the current one, so "← Back" knows
 * whether going back stays on the site. Rendered once in the layout.
 */
export function NavHistory() {
  const pathname = usePathname()
  useEffect(() => {
    try {
      const current = sessionStorage.getItem(CURRENT)
      if (current && current !== pathname) sessionStorage.setItem(PREVIOUS, current)
      sessionStorage.setItem(CURRENT, pathname)
    } catch {}
  }, [pathname])
  return null
}

/**
 * "← Back": returns to the previous page of this site when there is one,
 * otherwise (opened from a link elsewhere) goes to `fallback`.
 */
export function BackLink({ fallback = '/' }: { fallback?: string }) {
  const router = useRouter()
  return (
    <Link
      className="text-link back-link"
      href={fallback}
      onClick={(e) => {
        let previous: string | null = null
        try {
          previous = sessionStorage.getItem(PREVIOUS)
        } catch {}
        if (previous && previous !== window.location.pathname) {
          e.preventDefault()
          router.back()
        }
      }}
    >
      ← Back
    </Link>
  )
}

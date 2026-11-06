'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import type { Currency } from '@/lib/countries'
import type { Product } from '@/payload-types'
import { useVariant, VariantPrice } from './Variants'

/**
 * Phones: once the visitor scrolls past the buy button, a slim bar at the bottom keeps the
 * chosen box, its price and "Buy now" in reach. The button submits the same form as the main
 * one (via the form attribute), so quantity, size and box are always the ones picked above.
 */
export function StickyBuy({
  formId,
  base,
  currency,
}: {
  formId: string
  base: Pick<Product, 'price' | 'priceEUR'>
  currency?: Currency
}) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const state = useVariant()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const form = document.getElementById(formId)
    if (!form) return
    const observer = new IntersectionObserver(([entry]) => {
      // only after scrolling past it, not while the visitor has not reached it yet
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(form)
    return () => observer.disconnect()
  }, [formId])

  const choice = [state?.active?.name, state?.size?.label].filter(Boolean).join(' · ')

  // rendered on <body>: the product column animates in with a transform, which would pin a
  // fixed bar to the column instead of the screen
  if (!mounted) return null
  return createPortal(
    <div aria-hidden={!visible} className={`sticky-buy${visible ? ' is-visible' : ''}`}>
      <div className="sticky-buy-info">
        {choice && <span className="sticky-buy-choice">{choice}</span>}
        <VariantPrice base={base} className="sticky-buy-price" currency={currency} />
      </div>
      <button className="btn btn-gold" form={formId} tabIndex={visible ? 0 : -1} type="submit">
        Buy now
      </button>
    </div>,
    document.body,
  )
}

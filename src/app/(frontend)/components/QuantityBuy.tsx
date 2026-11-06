'use client'

import { useState } from 'react'

import { useVariant } from './Variants'

const MAX_QUANTITY = 10

/** Quantity stepper + buy button; submits to /checkout as a plain GET form. */
export function QuantityBuy({ slug }: { slug: string }) {
  const [qty, setQty] = useState(1)
  const state = useVariant()
  const variant = state?.active
  const size = state?.size

  return (
    <form action="/checkout" className="buy" method="get">
      <input name="product" type="hidden" value={slug} />
      {variant && <input name="variant" type="hidden" value={variant.id} />}
      {size && <input name="size" type="hidden" value={size.id} />}
      <input name="qty" type="hidden" value={qty} />
      <div className="stepper" role="group" aria-label="Quantity">
        <button
          aria-label="Decrease quantity"
          disabled={qty <= 1}
          onClick={() => setQty(qty - 1)}
          type="button"
        >
          −
        </button>
        <span aria-live="polite">{qty}</span>
        <button
          aria-label="Increase quantity"
          disabled={qty >= MAX_QUANTITY}
          onClick={() => setQty(qty + 1)}
          type="button"
        >
          +
        </button>
      </div>
      <button className="btn btn-gold btn-wide" type="submit">
        Buy now
      </button>
    </form>
  )
}

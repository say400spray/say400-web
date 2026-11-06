'use client'

import { createContext, useContext, useRef, useState } from 'react'

import type { Currency } from '@/lib/countries'
import { formatMoney } from '@/lib/orderStatus'
import { firstOrderPriceFor, priceFor } from '@/lib/pricing'
import type { SizeOption, VariantOption } from '@/lib/variants'
import { Price } from './Price'

type VariantState = {
  variants: VariantOption[]
  sizes: SizeOption[]
  active: VariantOption | undefined
  size: SizeOption | undefined
  setActive: (id: string) => void
  setSize: (id: string) => void
  /** gallery position: 0 is the bottle, then the box front and back */
  slide: number
  setSlide: (slide: number) => void
  /** label of the first-order offer when this visitor can use it */
  offer: string | null
}

const VariantContext = createContext<VariantState | null>(null)

/** The selected variant and size, or null outside a VariantProvider. */
export const useVariant = () => useContext(VariantContext)

/** Shares the chosen box and size between the gallery, the pickers, the price and the buy button. */
export function VariantProvider({
  variants,
  sizes = [],
  offer = null,
  initial,
  children,
}: {
  variants: VariantOption[]
  /** variant to start with, e.g. picked on a collection card */
  initial?: string
  sizes?: SizeOption[]
  offer?: string | null
  children: React.ReactNode
}) {
  const chosen = variants.find((v) => v.id === initial)
  const [activeId, setActiveId] = useState(chosen?.id ?? variants[0]?.id)
  const [sizeId, setSize] = useState(sizes[0]?.id)
  // arriving with a chosen box shows that box instead of the bottle
  const [slide, setSlide] = useState(chosen ? 1 : 0)
  const active = variants.find((v) => v.id === activeId) ?? variants[0]
  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0]
  // picking a colour shows that box straight away
  const setActive = (id: string) => {
    setActiveId(id)
    setSlide(1)
  }
  return (
    <VariantContext.Provider
      value={{ variants, sizes, active, size, setActive, setSize, slide, setSlide, offer }}
    >
      {children}
    </VariantContext.Provider>
  )
}

/**
 * Product pictures: `children` (the bottle) first, then the chosen box front and back.
 * Arrows, dots and a horizontal swipe move between them.
 */
export function ProductGallery({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const state = useVariant()
  const startX = useRef<number | null>(null)
  const active = state?.active
  const pictures = [active?.front, active?.back].filter((p) => p != null)
  if (!state || !active || !pictures.length) return <>{children}</>

  const count = pictures.length + 1
  const index = Math.min(state.slide, count - 1)
  const go = (step: number) => state.setSlide((index + step + count) % count)
  const picture = index > 0 ? pictures[index - 1] : null
  const names = ['Bottle', 'Box, front', 'Box, back']

  return (
    <div
      className="gallery"
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        const dx = startX.current == null ? 0 : e.clientX - startX.current
        startX.current = null
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
      }}
    >
      {picture ? (
        // keyed so a new box or side fades in instead of swapping abruptly
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={picture.alt}
          className={`${className ?? ''} variant-image variant-photo`}
          draggable={false}
          key={picture.url}
          src={picture.url}
        />
      ) : (
        children
      )}
      <button
        aria-label="Previous image"
        className="gallery-arrow is-prev"
        onClick={() => go(-1)}
        type="button"
      />
      <button
        aria-label="Next image"
        className="gallery-arrow is-next"
        onClick={() => go(1)}
        type="button"
      />
      <div className="gallery-dots" role="group" aria-label="Product images">
        {Array.from({ length: count }, (_, i) => (
          <button
            aria-current={i === index}
            aria-label={names[i]}
            key={i}
            onClick={() => state.setSlide(i)}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}

/** Size chips (e.g. 6 ml / 12 ml); a size with the first-order offer gets a small tag. */
export function SizePicker() {
  const state = useVariant()
  if (!state || state.sizes.length < 2 || !state.size) return null
  const { sizes, size, setSize, offer } = state

  return (
    <div className="variants">
      <p className="variants-label">
        Size: <strong>{size.label}</strong>
      </p>
      <div className="variant-chips" role="radiogroup" aria-label="Size">
        {sizes.map((s) => (
          <button
            aria-checked={s.id === size.id}
            className="variant-chip size-chip"
            key={s.id}
            onClick={() => setSize(s.id)}
            role="radio"
            type="button"
          >
            {s.label}
            {offer && s.firstOrderDeal && s.id !== sizes[0].id && (
              <span className="chip-tag">Offer</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Colour chips with the strength; picking one changes the photo, price and what gets ordered. */
export function VariantPicker() {
  const state = useVariant()
  if (!state || state.variants.length < 2 || !state.active) return null
  const { variants, active, setActive } = state
  // the boxes are listed from lightest to strongest, so the position is the strength
  const step = variants.findIndex((v) => v.id === active.id) + 1
  const level = active.level || active.strength

  return (
    <div className="variants">
      <p className="variants-label">
        Choose your strength: <strong>{[active.name, level].filter(Boolean).join(' · ')}</strong>
      </p>
      <div className="variant-chips" role="radiogroup" aria-label="Colour and strength">
        {variants.map((v) => (
          <button
            aria-checked={v.id === active.id}
            aria-label={[v.name, v.level || v.strength].filter(Boolean).join(', ')}
            className="variant-chip"
            key={v.id}
            onClick={() => setActive(v.id)}
            role="radio"
            style={{ '--chip': v.color } as React.CSSProperties}
            type="button"
          >
            <span aria-hidden className="variant-dot" />
            <span aria-hidden className="variant-chip-text">
              {v.name}
              {(v.level || v.strength) && <small>{v.level || v.strength}</small>}
            </span>
          </button>
        ))}
      </div>
      <div className="variant-strength" style={{ '--chip': active.color } as React.CSSProperties}>
        <div className="strength-scale">
          <span className="strength-end">Gentle</span>
          <span
            aria-label={`Strength ${step} of ${variants.length}`}
            className="strength-bars"
            role="img"
          >
            {variants.map((v, i) => (
              <span className={i < step ? 'is-on' : undefined} key={v.id} />
            ))}
          </span>
          <span className="strength-end">Strongest</span>
        </div>
        {active.description && <p className="strength-text">{active.description}</p>}
      </div>
    </div>
  )
}

/**
 * Price of the chosen size / variant. With the first-order offer it shows the offer price
 * and the regular price struck through.
 */
export function VariantPrice({
  base,
  currency,
  className,
}: {
  base: { price: number; priceEUR?: number | null }
  currency?: Currency
  className?: string
}) {
  const state = useVariant()
  const active = state?.active
  const size = state?.size
  const regular = size ?? {
    price: active?.price ?? base.price,
    priceEUR: active?.priceEUR ?? base.priceEUR,
  }
  const shown = currency ?? 'GBP'
  const offerPrice = state?.offer ? firstOrderPriceFor(state, shown, size) : null
  if (offerPrice == null)
    return <Price className={className} currency={currency} product={regular} />

  const eur = currency ? null : firstOrderPriceFor(state!, 'EUR', size)
  return (
    <div className="offer-price">
      <p className="offer-tag">{state!.offer}</p>
      <p className={className}>
        {formatMoney(offerPrice, shown)}{' '}
        <s className="price-was">{formatMoney(priceFor(base, shown, null, regular), shown)}</s>
      </p>
      {eur != null && <p className="price-alt">{formatMoney(eur, 'EUR')} in the EU</p>}
    </div>
  )
}

/** Small colour dots for product cards: "available in 5 colours". */
export function VariantDots({ variants }: { variants: VariantOption[] }) {
  if (variants.length < 2) return null
  return (
    <span className="variant-dots" aria-label={`${variants.length} variants`}>
      {variants.map((v) => (
        <span key={v.id} style={{ '--chip': v.color } as React.CSSProperties} />
      ))}
    </span>
  )
}

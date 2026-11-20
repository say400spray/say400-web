'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A row of cards that scrolls sideways (swipe on phones), with previous / next buttons.
 * The buttons hide when there is nothing more to scroll to.
 */
export function Carousel({ children, label }: { children: React.ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  useEffect(() => {
    const el = track.current
    if (!el) return
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const go = (dir: 1 | -1) => {
    const el = track.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    el.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: 'smooth' })
  }

  return (
    <div aria-label={label} aria-roledescription="carousel" className="carousel" role="region">
      <div className="carousel-track" ref={track}>
        {children}
      </div>
      {!(edges.start && edges.end) && (
        <div className="carousel-nav">
          <button
            aria-label="Previous"
            className="carousel-btn"
            disabled={edges.start}
            onClick={() => go(-1)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            className="carousel-btn"
            disabled={edges.end}
            onClick={() => go(1)}
            type="button"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

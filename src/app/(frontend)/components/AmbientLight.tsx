'use client'

import { useEffect, useRef } from 'react'

/**
 * Two soft gold lights fixed behind the page that drift slowly as you scroll.
 * The scroll position is eased every frame so the movement stays smooth and subtle.
 */
export function AmbientLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let current = 0
    let hero = 0
    let frame = 0

    const tick = () => {
      const max = Math.max(root.scrollHeight - window.innerHeight, 1)
      const target = window.scrollY / max
      // how far the hero has scrolled out of view, 0 → 1, drives the hero parallax
      const heroTarget = Math.min(window.scrollY / window.innerHeight, 1)
      current += (target - current) * 0.06
      hero += (heroTarget - hero) * 0.12
      el.style.setProperty('--scroll', current.toFixed(4))
      root.style.setProperty('--hero-p', hero.toFixed(4))
      const settled = Math.abs(target - current) < 0.0005 && Math.abs(heroTarget - hero) < 0.0005
      frame = settled ? 0 : requestAnimationFrame(tick)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div aria-hidden className="ambient" ref={ref}>
      <span className="ambient-light ambient-a" />
      <span className="ambient-light ambient-b" />
    </div>
  )
}

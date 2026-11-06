'use client'

import { useEffect, useState } from 'react'

const INTERVAL_MS = 3800

/**
 * Top bar. Desktop shows the whole text; on phones the parts separated by " · " are shown
 * one at a time, so the bar always stays on a single line.
 */
export function Announcement({ text }: { text: string }) {
  const parts = text
    .split('·')
    .map((p) => p.trim())
    .filter(Boolean)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (parts.length < 2) return
    const timer = setInterval(() => setActive((i) => (i + 1) % parts.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [parts.length])

  return (
    <div className="announcement">
      <span className="announcement-full">{text}</span>
      {parts.length > 1 && (
        <span aria-hidden className="announcement-rotator">
          {parts.map((part, i) => (
            <span className={i === active ? 'is-active' : undefined} key={part}>
              {part}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}

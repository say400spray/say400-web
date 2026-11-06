'use client'

import { useRef, useState } from 'react'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * One question. Built on <details> so it still works without JavaScript; with JavaScript
 * the answer slides open and closed instead of jumping.
 */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const details = useRef<HTMLDetailsElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const running = useRef<Animation | null>(null)
  // drives the +/− icon right away, while the open attribute only changes after closing finishes
  const [open, setOpen] = useState(false)

  const toggle = (event: React.MouseEvent) => {
    const d = details.current
    const b = body.current
    if (!d || !b) return
    event.preventDefault()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      d.open = !d.open
      setOpen(d.open)
      return
    }

    // start from wherever an interrupted animation currently is
    const from = `${b.offsetHeight}px`
    const previous = running.current
    running.current = null
    previous?.cancel()

    if (!open) {
      setOpen(true)
      d.open = true
      running.current = b.animate(
        [
          { height: from, opacity: 0, transform: 'translateY(-6px)' },
          { height: `${b.scrollHeight}px`, opacity: 1, transform: 'none' },
        ],
        { duration: 450, easing: EASE },
      )
    } else {
      setOpen(false)
      const animation = b.animate(
        [
          { height: from, opacity: 1 },
          { height: '0px', opacity: 0 },
        ],
        { duration: 350, easing: EASE },
      )
      const finish = () => {
        if (running.current === animation) d.open = false
      }
      animation.onfinish = finish
      // safety net: animations pause in background tabs, but the item must still end up closed
      setTimeout(finish, 400)
      running.current = animation
    }
  }

  return (
    <details className="faq-item" data-open={open} ref={details}>
      <summary onClick={toggle}>
        <span>{question}</span>
        <span aria-hidden className="faq-icon" />
      </summary>
      <div className="faq-body" ref={body}>
        <p>{answer}</p>
      </div>
    </details>
  )
}

/** Accordion of questions and answers. */
export function FaqList({
  items,
}: {
  items: { id?: string | null; question: string; answer: string }[]
}) {
  return (
    <div className="faq">
      {items.map((item, i) => (
        <FaqItem answer={item.answer} key={item.id ?? i} question={item.question} />
      ))}
    </div>
  )
}

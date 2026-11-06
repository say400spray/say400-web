/**
 * Line icons for the "How it works" steps. Their strokes draw themselves in when the step
 * scrolls into view (pathLength 1, see .step-icon in styles.css), then a small loop plays:
 * mist from the spray, the clock hand turning, the two rings breathing.
 */

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 1.4,
} as const

export function SprayIcon() {
  return (
    <svg aria-hidden className="step-icon step-icon-spray" viewBox="0 0 48 48">
      <g {...common}>
        <path d="M13 21h12v20a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" pathLength={1} />
        <path d="M15 21v-4h8v4" pathLength={1} />
        <path d="M17 17v-5h7l3 2" pathLength={1} />
        <path d="M13 29h12" pathLength={1} />
      </g>
      <g className="step-mist" fill="currentColor">
        <circle cx="32" cy="12" r="1.1" />
        <circle cx="36" cy="9" r="0.9" />
        <circle cx="36" cy="15" r="0.9" />
        <circle cx="40" cy="12" r="0.8" />
        <circle cx="41" cy="7" r="0.6" />
        <circle cx="41" cy="17" r="0.6" />
      </g>
    </svg>
  )
}

export function WaitIcon() {
  return (
    <svg aria-hidden className="step-icon step-icon-wait" viewBox="0 0 48 48">
      <g {...common}>
        <circle cx="24" cy="27" r="14" pathLength={1} />
        <path d="M21 9h6M24 9v4M35 15l2.5-2.5" pathLength={1} />
      </g>
      <g className="step-hand" {...common}>
        <path d="M24 27V18" pathLength={1} />
      </g>
      <circle cx="24" cy="27" fill="currentColor" r="1.4" />
    </svg>
  )
}

export function EnjoyIcon() {
  return (
    <svg aria-hidden className="step-icon step-icon-enjoy" viewBox="0 0 48 48">
      <g {...common}>
        <circle className="step-ring step-ring-a" cx="19" cy="26" r="10" pathLength={1} />
        <circle className="step-ring step-ring-b" cx="29" cy="26" r="10" pathLength={1} />
      </g>
      <g className="step-sparks" fill="currentColor">
        <path d="M37 7l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
        <path d="M10 9l.6 1.8 1.8.6-1.8.6L10 13.8l-.6-1.8-1.8-.6 1.8-.6z" />
      </g>
    </svg>
  )
}

export const STEP_ICONS = [SprayIcon, WaitIcon, EnjoyIcon]

export function LeafIcon() {
  return (
    <svg aria-hidden className="step-icon benefit-icon-leaf" viewBox="0 0 48 48">
      <g className="leaf-sway" {...common}>
        <path d="M24 41c0-11 1-20 13-30-13 0-24 6-24 18 0 6 5 12 11 12z" pathLength={1} />
        <path d="M24 41c0-8 4-15 9-21" pathLength={1} />
        <path d="M21 31l-4-3M24 25l-4-4" pathLength={1} />
      </g>
    </svg>
  )
}

export function BottleIcon() {
  return (
    <svg aria-hidden className="step-icon benefit-icon-bottle" viewBox="0 0 48 48">
      <g {...common}>
        <path d="M19 6h10v6H19z" pathLength={1} />
        <path d="M17 12h14v28a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2z" pathLength={1} />
        <path d="M21 22h6" pathLength={1} />
      </g>
      <path
        className="bottle-glint"
        d="M20 15v20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg aria-hidden className="step-icon benefit-icon-check" viewBox="0 0 48 48">
      <g {...common}>
        <circle cx="24" cy="24" r="16" pathLength={1} />
        <path className="check-mark" d="M17 24.5l5 5 9-10" pathLength={1} />
      </g>
    </svg>
  )
}

export const BENEFIT_ICONS = [LeafIcon, BottleIcon, CheckIcon]

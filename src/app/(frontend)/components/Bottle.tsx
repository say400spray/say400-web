/**
 * Illustrated Say400 spray bottle, shown until real product photos are uploaded.
 * Layers, back to front: cylindrical body shading, rim lights, label (with a wrap shadow so the
 * print looks curved), specular highlights, a light sheen that sweeps across, then the metal pump.
 */
export function Bottle({
  className,
  label = 'Men Spray',
  accent,
  tag = 'For men',
}: {
  className?: string
  label?: string
  /** colour of a variant: the label rules, the bottom line and the rim light take it */
  accent?: string
  /** small text at the bottom of the label, e.g. the strength */
  tag?: string
}) {
  const text = label.toUpperCase()
  // long names get smaller, tighter type so they stay on the label
  const [fontSize, letterSpacing] =
    text.length > 14 ? [8.5, 2] : text.length > 11 ? [10, 3] : [11, 4]
  // identical bottles can share ids; different labels get their own
  const id = `b-${`${label}-${accent ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const ref = (name: string) => `url(#${id}-${name})`

  const body =
    'M36 152C36 130 52 118 78 114V102H122V114C148 118 164 130 164 152V404C164 418 152 430 138 430H62C48 430 36 418 36 404Z'

  return (
    <svg
      aria-label={`Say400 ${label}`}
      className={className}
      role="img"
      viewBox="0 0 200 436"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* black glass, lit from the front-left */}
        <linearGradient id={`${id}-body`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#030303" />
          <stop offset=".1" stopColor="#151515" />
          <stop offset=".2" stopColor="#3b3934" />
          <stop offset=".28" stopColor="#141414" />
          <stop offset=".55" stopColor="#060606" />
          <stop offset=".8" stopColor="#0e0d0b" />
          <stop offset=".93" stopColor="#2b2518" />
          <stop offset="1" stopColor="#050505" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".12" stopColor="#fff" stopOpacity="0" />
          <stop offset=".9" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".6" />
        </linearGradient>
        {/* brushed gold for the pump */}
        <linearGradient id={`${id}-gold`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#5a3e14" />
          <stop offset=".18" stopColor="#a8792c" />
          <stop offset=".34" stopColor="#fbe3a1" />
          <stop offset=".46" stopColor="#d9ae55" />
          <stop offset=".7" stopColor="#8a6424" />
          <stop offset=".88" stopColor="#c49a46" />
          <stop offset="1" stopColor="#4a3210" />
        </linearGradient>
        <linearGradient id={`${id}-print`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#966e2a" />
          <stop offset=".38" stopColor="#f9cf73" />
          <stop offset=".62" stopColor="#d0a446" />
          <stop offset="1" stopColor="#edc872" />
        </linearGradient>
        {/* darkens the label towards the sides so it reads as wrapped around a cylinder */}
        <linearGradient id={`${id}-wrap`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".85" />
          <stop offset=".22" stopColor="#000" stopOpacity=".1" />
          <stop offset=".5" stopColor="#000" stopOpacity="0" />
          <stop offset=".78" stopColor="#000" stopOpacity=".25" />
          <stop offset="1" stopColor="#000" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id={`${id}-spec`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff6dc" stopOpacity=".22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={body} />
        </clipPath>
      </defs>

      {/* body */}
      <path d={body} fill={ref('body')} />
      <path d={body} fill={ref('top')} />

      <g clipPath={ref('clip')}>
        {/* label */}
        <rect fill={accent ?? ref('print')} height="1.4" width="92" x="54" y="208" />
        <text
          fill={ref('print')}
          fontFamily="var(--font-serif), Georgia, serif"
          fontSize="34"
          textAnchor="middle"
          x="100"
          y="258"
        >
          say400
        </text>
        <rect fill={accent ?? ref('print')} height="1.4" width="92" x="54" y="278" />
        <text
          fill="#efe9dc"
          fontFamily="var(--font-sans), sans-serif"
          fontSize={fontSize}
          letterSpacing={letterSpacing}
          textAnchor="middle"
          x="100"
          y="304"
        >
          {text}
        </text>
        <text
          fill={accent ?? '#8f8879'}
          fontFamily="var(--font-sans), sans-serif"
          fontSize="8"
          letterSpacing="3"
          textAnchor="middle"
          x="100"
          y="380"
        >
          {tag.toUpperCase()}
        </text>
        {accent && <rect fill={accent} height="3" opacity=".85" width="128" x="36" y="392" />}
        <rect fill={ref('wrap')} height="330" width="128" x="36" y="100" />

        {/* specular highlights: main strip, soft secondary, right rim */}
        <rect
          fill={ref('spec')}
          filter={ref('soft')}
          height="270"
          rx="4"
          width="9"
          x="55"
          y="138"
        />
        <rect
          fill="#fff"
          filter={ref('soft')}
          height="230"
          opacity=".08"
          rx="3"
          width="16"
          x="72"
          y="150"
        />
        <rect
          fill={accent ?? '#f9cf73'}
          filter={ref('soft')}
          height="250"
          opacity={accent ? 0.4 : 0.22}
          rx="2"
          width="3"
          x="156"
          y="150"
        />

        {/* light sheen sweeping across every few seconds */}
        <rect
          className="bottle-sheen"
          fill={ref('sheen')}
          height="460"
          width="46"
          x="-60"
          y="-10"
        />
      </g>

      {/* shoulder reflection */}
      <path
        d="M58 132C66 122 80 118 92 117"
        fill="none"
        filter={ref('soft')}
        opacity=".45"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="2.5"
      />

      {/* pump: collar, cap, actuator, nozzle */}
      <rect fill={ref('gold')} height="14" rx="2" width="58" x="71" y="92" />
      <rect fill="#000" height="1" opacity=".35" width="58" x="71" y="99" />
      <rect fill={ref('gold')} height="62" rx="9" width="62" x="69" y="32" />
      {[78, 86, 94, 102, 110, 118].map((x) => (
        <rect fill="#000" height="44" key={x} opacity=".12" width="1" x={x} y="42" />
      ))}
      <rect
        fill="#fff"
        filter={ref('soft')}
        height="50"
        opacity=".35"
        rx="2"
        width="5"
        x="88"
        y="38"
      />
      <rect fill={ref('gold')} height="18" rx="5" width="38" x="81" y="16" />
      <rect fill="#1a1206" height="5" rx="2" width="9" x="117" y="21" />
      <ellipse cx="100" cy="17" fill="#fff" opacity=".25" rx="15" ry="1.5" />
    </svg>
  )
}

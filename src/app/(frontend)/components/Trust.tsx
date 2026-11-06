const trustItems = [
  {
    key: 'box',
    title: 'Discreet packaging',
    text: 'Plain box, no branding',
    icon: (
      <>
        <path className="trust-lid" d="M3 7.5 12 3l9 4.5-9 4.5z" pathLength={1} />
        <path d="M3 7.5v9L12 21l9-4.5v-9M12 12v9" pathLength={1} />
      </>
    ),
  },
  {
    key: 'truck',
    title: 'Ships from the UK',
    text: 'Tracked delivery, UK & EU',
    icon: (
      <>
        <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" pathLength={1} />
        <circle cx="7" cy="17" pathLength={1} r="1.5" />
        <circle cx="17" cy="17" pathLength={1} r="1.5" />
        <path className="trust-speed" d="M1 9h1.2M0.5 12h1.7" pathLength={1} />
      </>
    ),
  },
  {
    key: 'lock',
    title: 'Secure payment',
    text: 'Encrypted checkout by Mollie',
    icon: (
      <>
        <path className="trust-shackle" d="M7 10V8a5 5 0 0 1 10 0v2" pathLength={1} />
        <path d="M5 10h14v11H5zM12 14v3" pathLength={1} />
      </>
    ),
  },
  {
    key: 'returns',
    title: '14-day returns',
    text: 'On unopened products',
    icon: (
      <g className="trust-arrow">
        <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" pathLength={1} />
      </g>
    ),
  },
]

/** Row of reassurance points shown right under the hero. */
export function TrustBar() {
  return (
    <div className="trust-bar">
      {trustItems.map((item, i) => (
        <div
          className={`trust-item trust-${item.key}`}
          data-reveal
          key={item.key}
          style={{ transitionDelay: `${i * 90}ms` }}
        >
          <span className="trust-badge">
            <svg aria-hidden className="trust-icon" viewBox="0 0 24 24">
              {item.icon}
            </svg>
          </span>
          <div>
            <p className="trust-title">{item.title}</p>
            <p className="trust-text">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const paymentMethods = ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay', 'Google Pay']

/** Accepted payment methods as one quiet line under the buy button. */
export function PaymentMethods({ className }: { className?: string }) {
  return (
    <div className={`payment-methods ${className ?? ''}`}>
      <p className="payment-secure">
        <svg aria-hidden viewBox="0 0 24 24">
          <rect height="10" rx="2" width="14" x="5" y="11" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        Secure checkout
      </p>
      <ul aria-label="Accepted payment methods">
        {paymentMethods.map((method) => (
          <li key={method}>{method}</li>
        ))}
      </ul>
    </div>
  )
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className="stars" role="img">
      {'★★★★★'.slice(0, rating)}
      <span className="stars-off">{'★★★★★'.slice(rating)}</span>
    </span>
  )
}

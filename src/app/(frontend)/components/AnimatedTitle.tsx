/** Section title whose words rise in one after another when it scrolls into view. */
export function AnimatedTitle({
  text,
  gold,
  className,
}: {
  text: string
  gold?: string
  className?: string
}) {
  const words = text.split(' ').map((word) => ({ word, gold: false }))
  if (gold) words.push(...gold.split(' ').map((word) => ({ word, gold: true })))

  return (
    <h2
      aria-label={gold ? `${text} ${gold}` : text}
      className={`section-title split ${className ?? ''}`}
      data-reveal
    >
      {words.map(({ word, gold: isGold }, i) => (
        <span aria-hidden className="word" key={i} style={{ '--i': i } as React.CSSProperties}>
          <span className={isGold ? 'gold-text' : undefined}>{word}</span>
        </span>
      ))}
    </h2>
  )
}

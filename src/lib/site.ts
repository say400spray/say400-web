export function siteUrl(): string {
  // server-only variable: read when the server starts, so the URL can change without a rebuild
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

/** Only allow redirects to paths on this site (prevents open redirects via ?next=). */
export function safePath(value: string | undefined, fallback: string): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

/** Mollie cannot call webhooks on localhost; without a public URL we sync on the return page instead. */
export function isPublicSiteUrl(): boolean {
  return !/\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(siteUrl())
}

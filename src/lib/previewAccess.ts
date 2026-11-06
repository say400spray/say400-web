/** Password gate for sharing a preview of the site (active only when PREVIEW_PASSWORD is set). */
export const PREVIEW_COOKIE = 'preview_access'

export function previewPassword(): string | null {
  return process.env.PREVIEW_PASSWORD || null
}

/** Cookie value: a hash, so the password itself is never stored in the browser. */
export async function previewToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}:${process.env.PAYLOAD_SECRET ?? ''}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

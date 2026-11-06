/** Cookie consent shared by the banner and any script that needs it (analytics, ads). */
export interface Consent {
  analytics: boolean
  marketing: boolean
  /** ISO date the choice was made (proof of consent) */
  date: string
  version: number
}

export const CONSENT_COOKIE = 'cookie_consent'
export const CONSENT_VERSION = 1
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 182 // ~6 months, then we ask again
export const CONSENT_EVENT = 'cookie-consent-change'
export const OPEN_SETTINGS_EVENT = 'open-cookie-settings'

export function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1)
  if (!raw) return null
  try {
    const consent = JSON.parse(decodeURIComponent(raw)) as Consent
    return consent.version === CONSENT_VERSION ? consent : null
  } catch {
    return null
  }
}

export function saveConsent(choice: Pick<Consent, 'analytics' | 'marketing'>): Consent {
  const consent: Consent = { ...choice, date: new Date().toISOString(), version: CONSENT_VERSION }
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }))
  return consent
}

export type Currency = 'GBP' | 'EUR'

interface Country {
  code: string
  name: string
  /** Postcode format; countries without one accept any 2–10 character code */
  postcode?: RegExp
}

/** Countries we ship to from the UK: the United Kingdom and the EU-27. */
export const COUNTRIES: Country[] = [
  { code: 'GB', name: 'United Kingdom', postcode: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i },
  { code: 'AT', name: 'Austria', postcode: /^\d{4}$/ },
  { code: 'BE', name: 'Belgium', postcode: /^\d{4}$/ },
  { code: 'BG', name: 'Bulgaria', postcode: /^\d{4}$/ },
  { code: 'HR', name: 'Croatia', postcode: /^\d{5}$/ },
  { code: 'CY', name: 'Cyprus', postcode: /^\d{4}$/ },
  { code: 'CZ', name: 'Czechia', postcode: /^\d{3} ?\d{2}$/ },
  { code: 'DK', name: 'Denmark', postcode: /^\d{4}$/ },
  { code: 'EE', name: 'Estonia', postcode: /^\d{5}$/ },
  { code: 'FI', name: 'Finland', postcode: /^\d{5}$/ },
  { code: 'FR', name: 'France', postcode: /^\d{5}$/ },
  { code: 'DE', name: 'Germany', postcode: /^\d{5}$/ },
  { code: 'GR', name: 'Greece', postcode: /^\d{3} ?\d{2}$/ },
  { code: 'HU', name: 'Hungary', postcode: /^\d{4}$/ },
  { code: 'IE', name: 'Ireland', postcode: /^[A-Z\d]{3} ?[A-Z\d]{4}$/i },
  { code: 'IT', name: 'Italy', postcode: /^\d{5}$/ },
  { code: 'LV', name: 'Latvia', postcode: /^(LV-?)?\d{4}$/i },
  { code: 'LT', name: 'Lithuania', postcode: /^(LT-?)?\d{5}$/i },
  { code: 'LU', name: 'Luxembourg', postcode: /^(L-?)?\d{4}$/i },
  { code: 'MT', name: 'Malta', postcode: /^[A-Z]{3} ?\d{2,4}$/i },
  { code: 'NL', name: 'Netherlands', postcode: /^\d{4} ?[A-Z]{2}$/i },
  { code: 'PL', name: 'Poland', postcode: /^\d{2}-?\d{3}$/ },
  { code: 'PT', name: 'Portugal', postcode: /^\d{4}-?\d{3}$/ },
  { code: 'RO', name: 'Romania', postcode: /^\d{6}$/ },
  { code: 'SK', name: 'Slovakia', postcode: /^\d{3} ?\d{2}$/ },
  { code: 'SI', name: 'Slovenia', postcode: /^\d{4}$/ },
  { code: 'ES', name: 'Spain', postcode: /^\d{5}$/ },
  { code: 'SE', name: 'Sweden', postcode: /^\d{3} ?\d{2}$/ },
]

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code)

export function countryName(code: string | null | undefined): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? String(code ?? '')
}

export function isSupportedCountry(code: string | null | undefined): boolean {
  return Boolean(code && COUNTRY_CODES.includes(code))
}

/** UK orders are charged in pounds, everything else ships from the UK in euros. */
export function currencyFor(countryCode: string | null | undefined): Currency {
  return !countryCode || countryCode === 'GB' ? 'GBP' : 'EUR'
}

interface AddressLike {
  fullName?: string | null
  line1?: string | null
  line2?: string | null
  city?: string | null
  county?: string | null
  postcode?: string | null
  country?: string | null
}

/** Address as printable lines; UK puts the postcode last, most of the EU puts it before the city. */
export function addressLines(a: AddressLike): string[] {
  const cityLine =
    !a.country || a.country === 'GB' || a.country === 'IE'
      ? [a.city, a.county, a.postcode]
      : [[a.postcode, a.city].filter(Boolean).join(' '), a.county]
  return [a.fullName, a.line1, a.line2, ...cityLine, countryName(a.country || 'GB')].filter(
    (line): line is string => Boolean(line),
  )
}

/** Returns the postcode tidied up (upper case, UK-style space), or null if it does not match the country. */
export function normalizePostcode(countryCode: string, value: string): string | null {
  const trimmed = value.trim().toUpperCase().replace(/\s+/g, ' ')
  const country = COUNTRIES.find((c) => c.code === countryCode)
  if (!country) return null
  if (countryCode === 'GB') {
    const match = trimmed.replace(/\s/g, '').match(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/)
    return match ? `${match[1]} ${match[2]}` : null
  }
  if (country.postcode) return country.postcode.test(trimmed) ? trimmed : null
  return /^[A-Z\d -]{2,10}$/.test(trimmed) ? trimmed : null
}

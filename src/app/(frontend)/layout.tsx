import { Jost, Playfair_Display } from 'next/font/google'
import { cached } from '@/lib/cms'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { offerFor } from '@/lib/offer'
import { getSampleCampaign } from '@/lib/samples'
import { getCurrentCustomer, getPayloadClient } from '@/lib/payload'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, indexable } from '@/lib/seo'
import { siteUrl } from '@/lib/site'
import { logoutAction } from './actions'
import { AgeGate } from './components/AgeGate'
import { AmbientLight } from './components/AmbientLight'
import { Announcement } from './components/Announcement'
import { NavHistory } from './components/BackLink'
import { CookieConsent, CookieSettingsButton } from './components/CookieConsent'
import { SamplePopup } from './components/SamplePopup'
import { OfferPopup } from './components/OfferPopup'
import { Reveal } from './components/Reveal'
import { Spotlight } from './components/Spotlight'
import './styles.css'

// high-contrast serif with ball terminals, like "say" in the logo
const serif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-serif',
})

const sans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
})

// every page shows the logged-in customer and shop settings, so nothing is pre-rendered at build
// time (the build has no database or PAYLOAD_SECRET, e.g. on Vercel)
export const dynamic = 'force-dynamic'

/** Footer "Help" column: these pages, under shorter names. */
const HELP_LABELS: Record<string, string> = {
  shipping: 'Shipping & delivery',
  returns: 'Returns',
}

// read per request, so SITE_URL and the preview password apply without a rebuild
export function generateMetadata(): Metadata {
  return {
    // absolute URLs for link previews (WhatsApp, social) come from SITE_URL
    metadataBase: new URL(siteUrl()),
    title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    robots: indexable()
      ? { index: true, follow: true, googleBot: { 'max-image-preview': 'large' } }
      : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_GB',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [{ url: '/brand/og-image.jpg', alt: 'Say400 Men Spray' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: ['/brand/og-image.jpg'],
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer()
  const payload = await getPayloadClient()
  const [{ docs: legalPages }, company, settings, offer, { totalDocs: offerProducts }] =
    await Promise.all([
      cached(['footer-pages'], () =>
        payload.find({
          collection: 'pages',
          where: { showInFooter: { equals: true } },
          sort: 'footerOrder',
          limit: 20,
          depth: 0,
          select: { title: true, slug: true },
        }),
      ),
      cached(['company-info'], () => payload.findGlobal({ slug: 'company-info' })),
      cached(['shop-settings'], () => payload.findGlobal({ slug: 'shop-settings' })),
      offerFor(payload, customer),
      // the pop-up only makes sense while some size actually has the offer
      cached(['offer-products'], () =>
        payload.count({
          collection: 'products',
          where: { active: { equals: true }, 'sizes.firstOrderDeal': { equals: true } },
        }),
      ),
    ])

  // free sample pop-up for visitors who have not asked for one yet, while samples are left
  const samples = await getSampleCampaign(payload)
  const sampleRequested =
    customer && samples
      ? (
          await payload.count({
            collection: 'sample-requests',
            where: { customer: { equals: customer.id } },
          })
        ).totalDocs > 0
      : false
  const samplePopup = samples && samples.remaining > 0 && !sampleRequested ? samples : null

  // delivery and returns are what shoppers look for; the rest is the legal small print
  const helpOrder = Object.keys(HELP_LABELS)
  const helpPages = legalPages
    .filter((p) => p.slug in HELP_LABELS)
    .sort((a, b) => helpOrder.indexOf(a.slug) - helpOrder.indexOf(b.slug))
  const legalOnly = legalPages.filter((p) => !(p.slug in HELP_LABELS))

  return (
    <html className={`${serif.variable} ${sans.variable}`} lang="en-GB">
      <body>
        <AmbientLight />
        <header className="site-header">
          {settings.announcement && <Announcement text={settings.announcement} />}
          <div className="container header-inner">
            <Link aria-label="Say400 home" className="logo" href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="say400" height={40} src="/brand/logo.svg" width={108} />
            </Link>
            <nav className="nav">
              <Link className="nav-link" href="/#product">
                Shop
              </Link>
              {customer ? (
                <>
                  <Link className="nav-link" href="/account">
                    Account
                  </Link>
                  <form action={logoutAction}>
                    <button className="nav-link link-button" type="submit">
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link className="nav-link" href="/login">
                    Log in
                  </Link>
                  <Link className="btn btn-outline btn-small" href="/register">
                    Join
                  </Link>
                </>
              )}
              {samplePopup && (
                <Link className="btn btn-primary btn-small nav-sample" href="/free-sample">
                  <span className="nav-sample-long">Get my free sample</span>
                  <span className="nav-sample-short">Free sample</span>
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container footer-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="say400"
              className="footer-logo"
              height={30}
              src="/brand/logo.svg"
              width={81}
            />
            {/* each phrase stays whole, so narrow screens break between phrases, not inside one */}
            <p className="footer-meta">
              <span>Discreet packaging</span> <span>UK & EU delivery</span>{' '}
              <span>Secure payments</span>
            </p>
            <div className="footer-groups">
              <nav aria-labelledby="footer-help" className="footer-group">
                <p className="footer-group-title" id="footer-help">
                  Help
                </p>
                {helpPages.map((page) => (
                  <Link className="footer-link" href={`/legal/${page.slug}`} key={page.id}>
                    {HELP_LABELS[page.slug] ?? page.title}
                  </Link>
                ))}
                {settings.freeSamples?.enabled && (
                  <Link className="footer-link" href="/free-sample">
                    Free sample
                  </Link>
                )}
                <Link className="footer-link" href="/#faq">
                  FAQ
                </Link>
                {company.email && (
                  <a className="footer-link" href={`mailto:${company.email}`}>
                    Contact us
                  </a>
                )}
              </nav>
              <nav aria-labelledby="footer-legal" className="footer-group">
                <p className="footer-group-title" id="footer-legal">
                  Legal
                </p>
                {legalOnly.map((page) => (
                  <Link className="footer-link" href={`/legal/${page.slug}`} key={page.id}>
                    {page.title}
                  </Link>
                ))}
                <CookieSettingsButton />
              </nav>
            </div>
            <p className="footer-small">
              For adults 18+ only. © {new Date().getFullYear()} {company.legalName || 'Say400'}
              {company.companyNumber && ` · Company no. ${company.companyNumber}`}
              {company.vatNumber && ` · VAT ${company.vatNumber}`}
            </p>
          </div>
        </footer>
        <AgeGate />
        <CookieConsent />
        <NavHistory />
        {samplePopup && (
          <SamplePopup
            limit={samplePopup.limit}
            remaining={samplePopup.remaining}
            sampleLabel={samplePopup.sampleLabel}
          />
        )}
        {!samplePopup && offer && (offer.kind === 'percent' || offerProducts > 0) && (
          <OfferPopup
            badge={offer.badge}
            kind={offer.kind}
            loggedIn={Boolean(customer)}
            percent={offer.percent}
            text={offer.text}
            title={offer.title}
          />
        )}
        <Reveal />
        <Spotlight />
      </body>
    </html>
  )
}

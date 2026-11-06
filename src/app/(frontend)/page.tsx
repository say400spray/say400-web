import Link from 'next/link'

import { cached } from '@/lib/cms'
import { currencyFor } from '@/lib/countries'
import { formatMoney } from '@/lib/orderStatus'
import { getCurrentCustomer, getPayloadClient } from '@/lib/payload'
import { priceFor } from '@/lib/pricing'
import { offerFor } from '@/lib/offer'
import { getSampleCampaign } from '@/lib/samples'
import { absoluteUrl, jsonLd, SITE_NAME } from '@/lib/seo'
import { activeVariants, sizeOptions, variantOptions } from '@/lib/variants'
import { ratingSummary, visibleReviewsWhere } from '@/lib/reviews'
import { toVideoItem } from '@/lib/videos'
import { AnimatedTitle } from './components/AnimatedTitle'
import { Bottle } from './components/Bottle'
import { FaqList } from './components/FaqList'
import { BENEFIT_ICONS, STEP_ICONS } from './components/StepIcons'
import { Price } from './components/Price'
import { ProductImage } from './components/ProductImage'
import {
  VariantDots,
  ProductGallery,
  SizePicker,
  VariantPicker,
  VariantPrice,
  VariantProvider,
} from './components/Variants'
import { QuantityBuy } from './components/QuantityBuy'
import { StickyBuy } from './components/StickyBuy'
import { PaymentMethods, Stars, TrustBar } from './components/Trust'
import { VideoSection } from './components/VideoSection'

export const dynamic = 'force-dynamic'

export const metadata = { alternates: { canonical: '/' } }

const benefits = [
  { title: 'Natural formula', text: 'Acmella, damiana, ginkgo and ginseng.' },
  { title: 'Pocket-size', text: 'A slim bottle that goes anywhere.' },
  { title: 'Simple to use', text: 'A few sprays, a few minutes. That’s it.' },
]

const steps = [
  { title: 'Spray', text: 'Apply a few sprays where needed.' },
  { title: 'Wait', text: 'Give it a few minutes to absorb.' },
  { title: 'Enjoy', text: 'Stay in the moment, with confidence.' },
]

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [{ docs: products }, { docs: reviews }, faq, customer, { docs: videoDocs }] =
    await Promise.all([
      cached(['home-products'], () =>
        payload.find({
          collection: 'products',
          where: { active: { equals: true } },
          sort: 'createdAt',
          limit: 20,
          overrideAccess: false,
        }),
      ),
      cached(['home-reviews'], () =>
        payload.find({
          collection: 'reviews',
          where: visibleReviewsWhere(),
          sort: '-createdAt',
          limit: 6,
          depth: 0,
          overrideAccess: false,
        }),
      ),
      cached(['faq'], () => payload.findGlobal({ slug: 'faq' })),
      getCurrentCustomer(),
      cached(['home-videos'], () =>
        payload.find({
          collection: 'videos',
          where: { active: { equals: true } },
          sort: 'order',
          limit: 20,
          depth: 1,
          overrideAccess: false,
        }),
      ),
    ])
  const [featured, ...others] = products
  // the main product's boxes, one card per colour / strength
  const collection = featured ? variantOptions(featured) : []
  const videos = videoDocs.map(toVideoItem)
  const [offer, samples] = await Promise.all([
    offerFor(payload, customer),
    getSampleCampaign(payload),
  ])
  const currency = customer?.shipping?.country ? currencyFor(customer.shipping.country) : undefined

  const fromPrices = products
    .flatMap((p) => {
      if (p.sizes?.length) return p.sizes.map((s) => priceFor(p, currency ?? 'GBP', null, s))
      const variants = activeVariants(p)
      return variants.length
        ? variants.map((v) => priceFor(p, currency ?? 'GBP', v))
        : [priceFor(p, currency ?? 'GBP')]
    })
    .filter((p): p is number => p != null)
  const fromPrice = fromPrices.length ? Math.min(...fromPrices) : null
  const { average: avgRating, count: ratingCount } = ratingSummary(reviews)

  const company = await cached(['company-info'], () => payload.findGlobal({ slug: 'company-info' }))
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      legalName: company.legalName || undefined,
      url: absoluteUrl('/'),
      logo: absoluteUrl('/brand/logo-full.svg'),
      ...(company.email && {
        contactPoint: {
          '@type': 'ContactPoint',
          email: company.email,
          contactType: 'customer service',
          areaServed: ['GB', 'EU'],
          availableLanguage: 'English',
        },
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: absoluteUrl('/'),
      inLanguage: 'en-GB',
    },
  ]

  return (
    <>
      <script dangerouslySetInnerHTML={jsonLd(structuredData)} type="application/ld+json" />
      <section className="hero">
        <div className="hero-glow" aria-hidden />
        <svg aria-hidden className="hero-rings" viewBox="0 0 600 400">
          <circle cx="240" cy="200" r="150" />
          <circle cx="360" cy="200" r="150" />
        </svg>
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">Say400 · Natural men’s spray</p>
            <h1 className="hero-title">
              Stay in control.
              <br />
              <em className="gold-text">Naturally.</em>
            </h1>
            <p className="hero-lead">
              Say400 Men Spray is a discreet, natural spray for men who want to feel confident and
              stay in the moment. Delivered in plain packaging across the UK & EU.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold" href="#product">
                Shop now
                {fromPrice != null && ` · from ${formatMoney(fromPrice, currency ?? 'GBP')}`}
              </Link>
              <Link className="btn btn-ghost" href="#faq">
                Questions?
              </Link>
            </div>
            <ul className="hero-checks">
              <li>Plain, unbranded box</li>
              <li>Secure checkout</li>
              <li>14-day returns</li>
            </ul>
          </div>
          {featured && (
            <div className="hero-visual" aria-hidden>
              <div className="feature-halo" />
              <ProductImage className="hero-product" product={featured} />
            </div>
          )}
        </div>
      </section>

      <section className="container trust-section">
        <TrustBar />
      </section>

      {featured && (
        <section className="feature" id="product">
          <VariantProvider
            offer={offer?.kind === 'size' ? offer.badge : null}
            sizes={sizeOptions(featured)}
            variants={variantOptions(featured)}
          >
            <div className="container feature-inner">
              <div className="feature-visual" data-reveal>
                <div className="feature-halo" aria-hidden />
                <ProductGallery className="feature-image">
                  <ProductImage className="feature-image" product={featured} />
                </ProductGallery>
              </div>
              <div className="feature-copy" data-reveal>
                <p className="eyebrow">Bestseller</p>
                <h2 className="feature-title">{featured.name}</h2>
                {featured.shortDescription && (
                  <p className="feature-lead">{featured.shortDescription}</p>
                )}
                {ratingCount > 0 && (
                  <p className="rating-line">
                    <Stars rating={Math.round(avgRating)} /> {avgRating.toFixed(1)} · {ratingCount}{' '}
                    review
                    {ratingCount === 1 ? '' : 's'}
                  </p>
                )}
                <div className="feature-options">
                  <SizePicker />
                  <VariantPicker />
                </div>
                <VariantPrice base={featured} className="feature-price" currency={currency} />
                {offer?.kind === 'percent' && (
                  <p className="offer-note">
                    <span aria-hidden className="offer-note-badge">
                      −{offer.percent}%
                    </span>
                    {offer.badge}, applied at checkout
                  </p>
                )}
                <QuantityBuy id="buy-form" slug={featured.slug} />
                <StickyBuy base={featured} currency={currency} formId="buy-form" />
                <PaymentMethods />
                <ul className="feature-points">
                  <li>Discreet delivery to the UK & EU</li>
                  <li>Nothing on the box or the label that reveals the contents</li>
                </ul>
                <Link className="text-link" href={`/products/${featured.slug}`}>
                  Ingredients, how to use & more →
                </Link>
              </div>
            </div>
          </VariantProvider>
        </section>
      )}

      {featured && collection.length > 1 && (
        <section className="section collection" id="collection">
          <div className="container">
            <p className="eyebrow center" data-reveal>
              The collection
            </p>
            <AnimatedTitle gold="strength" text="Find your" />
            <p className="collection-lead" data-reveal>
              One formula, five strengths. Each box has its own colour, so you always know which one
              is yours.
            </p>
            <div className="product-grid variant-grid">
              {collection.map((v, i) => (
                <Link
                  className="product-card variant-card"
                  data-spotlight
                  data-reveal
                  href={`/products/${featured.slug}?variant=${v.id}`}
                  key={v.id}
                  style={
                    { '--chip': v.color, transitionDelay: `${i * 100}ms` } as React.CSSProperties
                  }
                >
                  <div className="product-card-visual">
                    <Bottle
                      accent={v.color}
                      className="product-card-image"
                      label={featured.name}
                      tag={v.level || v.name}
                    />
                  </div>
                  <div className="product-card-body">
                    <p className="variant-card-colour">
                      <span aria-hidden className="variant-dot" />
                      {v.name}
                      {v.strength && ` · ${v.strength}`}
                    </p>
                    <h3>{v.level || v.name}</h3>
                    {v.description && <p className="product-card-text">{v.description}</p>}
                    <div className="product-card-foot">
                      <Price
                        className="price"
                        currency={currency}
                        product={
                          featured.sizes?.[0] ?? {
                            price: v.price ?? featured.price,
                            priceEUR: v.priceEUR ?? featured.priceEUR,
                          }
                        }
                      />
                      <span className="product-card-cta">Choose →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && collection.length < 2 && (
        <section className="section collection" id="collection">
          <div className="container">
            <p className="eyebrow center" data-reveal>
              The collection
            </p>
            <AnimatedTitle gold="formula" text="Find your" />
            <div className="product-grid">
              {others.map((product, i) => (
                <Link
                  className="product-card"
                  data-spotlight
                  data-reveal
                  href={`/products/${product.slug}`}
                  key={product.id}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="product-card-visual">
                    <ProductImage className="product-card-image" product={product} />
                  </div>
                  <div className="product-card-body">
                    <h3>{product.name}</h3>
                    <VariantDots variants={variantOptions(product)} />
                    {product.shortDescription && (
                      <p className="product-card-text">{product.shortDescription}</p>
                    )}
                    <div className="product-card-foot">
                      <Price className="price" currency={currency} product={product} />
                      <span className="product-card-cta">Discover →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="section videos" id="videos">
          <div className="container">
            <p className="eyebrow center" data-reveal>
              In motion
            </p>
            <AnimatedTitle gold="yourself" text="See it for" />
            <VideoSection videos={videos} />
          </div>
        </section>
      )}

      <section className="container section">
        <div className="benefits">
          {benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[i]
            return (
              <div
                className="benefit"
                data-reveal
                key={b.title}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span className="step-badge">{Icon && <Icon />}</span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="section how" id="how">
        <div className="container">
          <p className="eyebrow center" data-reveal>
            How it works
          </p>
          <AnimatedTitle text="Three simple steps" />
          <ol className="steps steps-how">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <li
                  data-reveal
                  data-spotlight
                  key={step.title}
                  style={{ transitionDelay: `${i * 140}ms` }}
                >
                  <span className="step-badge">{Icon && <Icon />}</span>
                  <span aria-hidden className="step-ghost">
                    0{i + 1}
                  </span>
                  <span className="step-number">0{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section reviews" id="reviews">
          <div className="container">
            <p className="eyebrow center" data-reveal>
              Reviews
            </p>
            <AnimatedTitle gold="say" text="What our customers" />
          </div>
          {/* endless row: the list twice, slid by half its width; the copy is hidden from screen readers */}
          <div
            className="review-marquee"
            data-reveal
            style={{ '--marquee-duration': `${reviews.length * 9}s` } as React.CSSProperties}
          >
            <div className="review-track">
              {[0, 1].map((copy) =>
                reviews.map((review) => {
                  const box = collection.find((v) => v.name === review.variant)
                  return (
                    <figure
                      aria-hidden={copy === 1 || undefined}
                      className="review-card"
                      data-spotlight
                      key={`${copy}-${review.id}`}
                      style={{ '--chip': box?.color ?? '#d9b45e' } as React.CSSProperties}
                    >
                      <div className="review-card-top">
                        <span className="review-score">
                          <Stars rating={review.rating} />
                          {review.rating.toFixed(1)}
                        </span>
                        {review.freeSample && <span className="sample-tag">Free sample</span>}
                      </div>
                      <blockquote>{review.text}</blockquote>
                      <figcaption>
                        <span aria-hidden className="review-avatar">
                          {review.name
                            .split(/\s+/)
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)}
                        </span>
                        <span className="review-who">
                          <strong>{review.name}</strong>
                          {review.country}
                        </span>
                        {box ? (
                          <span className="review-box">
                            <span aria-hidden className="variant-dot" />
                            {[box.name, box.level].filter(Boolean).join(' · ')}
                          </span>
                        ) : (
                          review.order && <span className="verified">Verified</span>
                        )}
                      </figcaption>
                    </figure>
                  )
                }),
              )}
            </div>
          </div>
        </section>
      )}

      {samples && samples.remaining > 0 && (
        <section className="section sample-cta">
          <div className="container">
            <Link className="sample-cta-card" data-reveal href="/free-sample">
              {/* three of the boxes, the middle one in front */}
              <div aria-hidden className="sample-cta-visual">
                {[collection[0], collection[1], collection[collection.length - 1]].map((box, i) => (
                  <span className={`sample-cta-bottle is-${i}`} key={i}>
                    <Bottle accent={box?.color} tag={samples.sampleLabel} />
                  </span>
                ))}
              </div>

              <div className="sample-cta-copy">
                <p className="sample-cta-eyebrow">
                  <span aria-hidden className="sample-cta-pulse" />
                  Free sample · while they last
                </p>
                <h2>
                  Try it free. <span className="gold-text">Tell us honestly.</span>
                </h2>
                <p className="muted">
                  A free {samples.sampleLabel} for the first {samples.limit} people. Try it, then
                  leave your honest review.
                </p>
              </div>

              <div className="sample-cta-side">
                <p className="sample-cta-count">
                  <strong>{samples.remaining}</strong>
                  <span>of {samples.limit} left</span>
                </p>
                <span aria-hidden className="sample-meter">
                  <span
                    style={{
                      width: `${((samples.limit - samples.remaining) / samples.limit) * 100}%`,
                    }}
                  />
                </span>
                <span className="btn btn-primary">Get my free sample</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {faq.items && faq.items.length > 0 && (
        <section className="section faq-section" id="faq">
          <div className="container narrow-wide">
            <p className="eyebrow center" data-reveal>
              FAQ
            </p>
            <AnimatedTitle gold="questions" text="Good" />
            <div data-reveal>
              <FaqList items={faq.items} />
            </div>
          </div>
        </section>
      )}

      <section className="cta">
        <div className="container cta-inner" data-reveal>
          <h2>
            Ready <em>when you are.</em>
          </h2>
          <Link className="btn btn-gold" href="#product">
            Order now
          </Link>
          <p className="cta-note">
            Discreet packaging · Secure payment · 14-day returns on unopened products
          </p>
        </div>
      </section>
    </>
  )
}

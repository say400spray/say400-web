import Link from 'next/link'

import { cached } from '@/lib/cms'
import { hasFreeDelivery } from '@/lib/delivery'
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
import { Carousel } from './components/Carousel'
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
import { DeliveryNote, PaymentMethods, Stars, TrustBar } from './components/Trust'
import { VideoSection } from './components/VideoSection'

export const dynamic = 'force-dynamic'

export const metadata = { alternates: { canonical: '/' } }

const benefits = [
  { title: 'Botanical formula', text: 'Acmella, damiana, ginkgo and ginseng.' },
  { title: 'Pocket-size', text: 'A slim, discreet bottle that goes anywhere.' },
  { title: 'Works in minutes', text: '2–3 sprays, ready in 2–5 minutes.' },
]

const steps = [
  { title: 'Spray', text: '2–3 sprays on the head and lower shaft.' },
  { title: 'Wait', text: '2–5 minutes to absorb and take effect.' },
  { title: 'Enjoy', text: 'Last longer and stay in control.' },
]

/** Who a delay spray is for, from the client's product information. */
const forWhom = [
  'Men who want to last longer in bed',
  'Men who finish sooner than they would like',
  'After a long time apart, or when you are very aroused',
  'Anyone who wants the moment to last for both of you',
]

/**
 * What medical sources say about delay sprays and creams as a method. They are about the
 * category (mostly lidocaine-based products), never about Say400: the note under the cards says so.
 */
const medicalSources = [
  {
    source: 'NHS',
    detail: 'UK National Health Service',
    text: 'Lists anaesthetic creams and sprays among the ways to manage premature ejaculation: they make the penis less sensitive, and work especially well with a condom.',
    href: 'https://www.nhs.uk/common-health-questions/sexual-health/can-premature-ejaculation-be-controlled/',
  },
  {
    source: 'European Medicines Agency',
    detail: 'EU medicines regulator',
    text: 'Approved a lidocaine/prilocaine delay spray for premature ejaculation in adult men, concluding that its benefits outweigh its risks.',
    href: 'https://www.ema.europa.eu/en/documents/assessment-report/lidocaine/prilocaine-plethora-epar-public-assessment-report_en.pdf',
  },
  {
    source: 'Systematic review, 2023',
    detail: 'Meta-analysis of clinical trials',
    text: 'Across the trials reviewed, topical anaesthetics lengthened the time to ejaculation more than placebo and several oral medicines.',
    href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10474909/',
  },
]

/** The practical points to know before using it. */
const goodToKnow = [
  {
    title: 'Patch-test first',
    text: 'Before the first use, put a little on the inside of your elbow or thigh and wait a couple of hours. No redness or itching? You are good to go.',
  },
  {
    title: 'Give it a few minutes',
    text: 'Let the spray absorb for 2–5 minutes before intimacy. That is when it starts to work, and it keeps the effect on you.',
  },
  {
    title: 'Condoms',
    text: 'Not every delay spray suits latex. Check the leaflet in the box before using it with condoms.',
  },
  {
    title: 'Control, not a cure',
    text: 'A delay spray helps you control the moment. It does not treat the causes of premature ejaculation, such as stress.',
  },
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
  const [offer, samples, freeDelivery] = await Promise.all([
    offerFor(payload, customer),
    getSampleCampaign(payload),
    hasFreeDelivery(payload),
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
            <p className="eyebrow hero-eyebrow">Say400 · Delay spray for men</p>
            <h1 className="hero-title">
              Last longer.
              <br />
              <em className="gold-text">Stay in control.</em>
            </h1>
            <p className="hero-lead">
              Say400 Men Spray is a discreet delay spray with a botanical formula. 2–3 sprays, a few
              minutes, and you stay in the moment for longer. Delivered in plain packaging across
              the UK & EU.
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
              {freeDelivery ? <li>Free UK &amp; EU delivery</li> : <li>Secure checkout</li>}
              <li>Plain, unbranded box</li>
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
        <TrustBar freeDelivery={freeDelivery} />
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
                {freeDelivery && <DeliveryNote />}
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

      <section className="section explainer" id="what-is-a-delay-spray">
        <div className="container explainer-inner">
          <div className="explainer-copy" data-reveal>
            <p className="eyebrow">The science, simply</p>
            <h2 className="explainer-title">
              What is a <em className="gold-text">delay spray?</em>
            </h2>
            <p>
              A delay spray, also called a prolonger, helps a man delay ejaculation so sex can last
              longer. The word comes from the Latin <em>prolongare</em>, to lengthen.
            </p>
            <p>
              It works by gently reducing the sensitivity of the head of the penis for a while. Not
              completely, just enough to slow the nerve signals that trigger climax, so you keep
              control for longer.
            </p>
            <p>
              Many delay sprays use a local anaesthetic such as lidocaine or benzocaine. Say400 is
              built on a botanical formula: acmella, a plant known for its natural, mild numbing
              effect, with damiana, ginkgo biloba, ginseng and taurine.
            </p>
          </div>
          <div className="explainer-card" data-reveal data-spotlight>
            <p className="explainer-card-title">Made for</p>
            <ul className="explainer-list">
              {forWhom.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <dl className="explainer-facts">
              <div>
                <dt>2–3</dt>
                <dd>sprays</dd>
              </div>
              <div>
                <dt>2–5</dt>
                <dd>minutes to work</dd>
              </div>
              <div>
                <dt>5</dt>
                <dd>strengths</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

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

          <div className="good-to-know" id="good-to-know">
            <p className="eyebrow center" data-reveal>
              Good to know
            </p>
            <ul className="notes">
              {goodToKnow.map((note, i) => (
                <li
                  className="note"
                  data-reveal
                  key={note.title}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <h3>{note.title}</h3>
                  <p>{note.text}</p>
                </li>
              ))}
            </ul>
          </div>
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

      <section className="section medical" id="what-doctors-say">
        <div className="container">
          <p className="eyebrow center" data-reveal>
            Delay sprays &amp; medicine
          </p>
          <AnimatedTitle gold="say" text="What the experts" />
          <p className="collection-lead" data-reveal>
            Delay sprays and creams are a recognised way to last longer. Here is what health
            authorities and research say about them.
          </p>
          <div data-reveal>
            <Carousel label="What medical sources say about delay sprays">
              {medicalSources.map((item) => (
                <a
                  className="medical-card"
                  data-spotlight
                  href={item.href}
                  key={item.source}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span aria-hidden className="medical-mark">
                    “
                  </span>
                  <p className="medical-text">{item.text}</p>
                  <span className="medical-source">
                    <strong>{item.source}</strong>
                    {item.detail}
                  </span>
                  <span className="medical-link">Read the source ↗</span>
                </a>
              ))}
            </Carousel>
          </div>
          <p className="medical-note" data-reveal>
            These sources are about delay sprays and creams in general, most of them
            lidocaine-based. They have not reviewed Say400, which uses a botanical formula.
          </p>
        </div>
      </section>

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

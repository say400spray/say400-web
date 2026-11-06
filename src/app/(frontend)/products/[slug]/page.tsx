import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { currencyFor } from '@/lib/countries'
import { offerFor } from '@/lib/offer'
import { ratingSummary, visibleReviewsWhere } from '@/lib/reviews'
import { sizeOptions, variantOptions } from '@/lib/variants'
import { getCurrentCustomer, getPayloadClient } from '@/lib/payload'
import { cached } from '@/lib/cms'
import { breadcrumbJsonLd, productImages, productJsonLd } from '@/lib/productSeo'
import { jsonLd } from '@/lib/seo'
import { FaqList } from '../../components/FaqList'
import { ProductImage } from '../../components/ProductImage'
import { QuantityBuy } from '../../components/QuantityBuy'
import {
  ProductGallery,
  SizePicker,
  VariantPicker,
  VariantPrice,
  VariantProvider,
} from '../../components/Variants'
import { PaymentMethods, Stars } from '../../components/Trust'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const { docs } = await cached(['product', slug], () =>
    payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: false,
    }),
  )
  const product = docs[0]
  if (!product) return {}
  const description =
    product.shortDescription ||
    `${product.name}: discreet delivery from the UK to the UK and the EU. Adults 18+.`
  const images = productImages(product).slice(0, 4)
  return {
    title: `${product.name} | Discreet Delay Spray`,
    description,
    // ?variant= only picks a box on the same page
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      siteName: 'Say400',
      locale: 'en_GB',
      title: `${product.name} | Say400`,
      description,
      url: `/products/${product.slug}`,
      ...(images.length && { images }),
    },
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ variant?: string }>
}) {
  const { slug } = await params
  const { variant: initialVariant } = await searchParams
  const payload = await getPayloadClient()
  const { docs } = await cached(['product', slug], () =>
    payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: false,
    }),
  )
  const product = docs[0]
  if (!product) notFound()

  const [customer, { docs: reviews }] = await Promise.all([
    getCurrentCustomer(),
    cached(['product-reviews', product.id], () =>
      payload.find({
        collection: 'reviews',
        where: visibleReviewsWhere({ product: { equals: product.id } }),
        sort: '-createdAt',
        limit: 20,
        depth: 0,
        overrideAccess: false,
      }),
    ),
  ])
  const offer = await offerFor(payload, customer)
  const currency = customer?.shipping?.country ? currencyFor(customer.shipping.country) : undefined
  const { average: avgRating, count: ratingCount } = ratingSummary(reviews)

  const details = [
    { question: 'How to use', answer: product.howToUse },
    { question: 'Ingredients', answer: product.ingredients },
    { question: 'Warnings', answer: product.warnings },
    {
      question: 'Delivery & returns',
      answer:
        'Shipped from the UK in plain, unbranded packaging with tracking. Unopened products can be returned within 14 days. See our Shipping and Returns policies for details.',
    },
  ].filter((d): d is { question: string; answer: string } => Boolean(d.answer))

  return (
    <>
      <script
        dangerouslySetInnerHTML={jsonLd([
          productJsonLd(product, { average: avgRating, count: ratingCount }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ])}
        type="application/ld+json"
      />
      <section className="feature feature-page">
        <VariantProvider
          initial={initialVariant}
          offer={offer?.kind === 'size' ? offer.badge : null}
          sizes={sizeOptions(product)}
          variants={variantOptions(product)}
        >
          <div className="container feature-inner">
            <div className="feature-visual">
              <div className="feature-halo" aria-hidden />
              <ProductGallery className="feature-image">
                <ProductImage className="feature-image" product={product} />
              </ProductGallery>
            </div>
            <div className="feature-copy">
              <Link className="text-link back-link" href="/">
                ← Back
              </Link>
              <p className="eyebrow">
                Say400
                {product.sizes?.length
                  ? ` · ${product.sizes.map((s) => s.label).join(' / ')}`
                  : product.size && ` · ${product.size}`}
              </p>
              <h1 className="feature-title">{product.name}</h1>
              {product.shortDescription && (
                <p className="feature-lead">{product.shortDescription}</p>
              )}
              {ratingCount > 0 && (
                <p className="rating-line">
                  <Stars rating={Math.round(avgRating)} /> {avgRating.toFixed(1)} · {ratingCount}{' '}
                  review
                  {ratingCount === 1 ? '' : 's'}
                </p>
              )}
              {product.highlights && product.highlights.length > 0 && (
                <ul className="highlights">
                  {product.highlights.map((h) => (
                    <li key={h.id}>{h.text}</li>
                  ))}
                </ul>
              )}
              <SizePicker />
              <VariantPicker />
              <VariantPrice base={product} className="feature-price" currency={currency} />
              {offer?.kind === 'percent' && (
                <p className="offer-note">
                  <span aria-hidden className="offer-note-badge">
                    −{offer.percent}%
                  </span>
                  {offer.badge}, applied at checkout
                </p>
              )}
              <QuantityBuy slug={product.slug} />
              <PaymentMethods />
              <ul className="feature-points">
                <li>Discreet delivery to the UK & EU</li>
                <li>Plain packaging, nothing reveals the contents</li>
                <li>For adults 18+ only</li>
              </ul>
            </div>
          </div>
        </VariantProvider>
      </section>

      <section className="container section narrow-wide product-details">
        {product.description && <p className="description">{product.description}</p>}
        <FaqList items={details} />

        {reviews.length > 0 && (
          <div className="product-reviews">
            <h2>Reviews</h2>
            {reviews.map((review) => (
              <figure className="review" key={review.id}>
                <Stars rating={review.rating} />
                <blockquote>“{review.text}”</blockquote>
                <figcaption>
                  {review.name}
                  {review.country && <span> · {review.country}</span>}
                  {review.order && <span className="verified">Verified purchase</span>}
                  {review.freeSample && <span className="sample-tag">Free sample</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

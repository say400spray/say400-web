# Men Stimulation — shop

Next.js 16 + Payload CMS 3 + PostgreSQL + Mollie + Resend.

## Setup

1. `pnpm install`
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `PAYLOAD_SECRET`, `MOLLIE_API_KEY`.
   The database must exist; in development Payload creates the tables automatically.
3. `pnpm dev` and open http://localhost:3000/admin to create the first admin user.
4. `pnpm seed` adds three demo products.

Local test customer (development database only): `test.customer@example.com` / `LocalTest-2026!`
(has a paid order, so no first-order offer). For the offer: `offer.test@example.com` / `OfferTest-2026!`
(only unpaid orders).

Customers and admins share the `payload-token` cookie, so use a separate browser
(or private window) for the admin panel while logged in as a customer.

## Sharing a preview

1. `pnpm build`
2. Start a tunnel in your own terminal: `ngrok http 3001`
3. Put the ngrok address in `.env.production.local` as `SITE_URL` (with a `PREVIEW_PASSWORD`).
4. `pnpm preview` (production server on port 3001). Every page asks for the preview password;
   the Mollie webhook stays reachable so test payments work end to end.

## Flow

1. Customer registers (`/register`) and saves a UK delivery address (`/account`).
2. `/checkout` creates an order with status `pending_payment` and redirects to Mollie.
3. Mollie sends the customer back to `/payment/return?order=…`. The status is always
   fetched from Mollie (`src/lib/payments`), never taken from the URL.
4. The webhook `/api/webhooks/mollie` marks the order `paid` and the confirmation email is sent.
   Mollie cannot reach `localhost`, so locally the return page does the check instead.
5. Staff move orders to `processing` / `shipped` in the admin; `shipped` emails the customer.

## Payment statuses

All logic is in `src/lib/payments/index.ts`; the status always comes from Mollie, never from the URL.

- **paid**: order → `paid`, confirmation email. A late payment also reopens an auto-cancelled order.
- **open / failed / canceled / expired**: order stays `pending_payment`; the return page offers "Try again".
- **pending** (bank still processing): the return page polls ~30 s, then tells the customer we will email them.
- **Retry**: every attempt is stored in `payment.attemptIds`; all are checked, so paying an older
  attempt still counts. If two attempts are paid, the extra one is refunded automatically and noted on the order.
- **Abandoned orders**: the `cancelUnpaidOrders` job (every 30 min) cancels orders unpaid for 48 h,
  after checking Mollie. It needs a long-running server (`next start`); on serverless hosting call
  `/api/payload-jobs/run` from a cron. Set `DISABLE_JOBS=true` to turn it off.

## UK + EU

- Shipping from the UK to the UK and the EU-27 (`src/lib/countries.ts`).
- UK orders are charged in GBP (`price`), EU orders in EUR (`priceEUR`); both set per product in the admin.
- Shipping fees per region in Shop settings.

## Legal

- Legal pages (`Pages` collection, `/legal/<slug>`) are created by `pnpm seed` from the templates in
  `src/scripts/legal-content.ts`. They are templates, not legal advice: replace every `[BRACKETED]`
  placeholder and have them reviewed before launch. Company details (admin → Company details) are shown
  under each legal page and in the footer.
- Cookie banner: `src/app/(frontend)/components/CookieConsent.tsx`. The choice is stored in the
  `cookie_consent` cookie; use `readConsent()` from `src/lib/consent.ts` and listen for the
  `cookie-consent-change` event before loading any analytics or marketing script.

## Where things live

- `src/collections` — Orders, Customers, Products, Media, Users (admins)
- `src/lib/payments` — provider-neutral payment layer, Mollie implementation
- `src/lib/email.ts` — Resend; without `RESEND_API_KEY` emails are only logged
- `src/app/(frontend)` — website pages and server actions

/**
 * Starting templates for the legal pages (UK + EU, goods shipped from the UK).
 * They are NOT legal advice: the shop owner must have them reviewed and replace
 * every [BRACKETED] placeholder. Company details are added automatically under each page.
 */
export const legalPages = [
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    footerOrder: 1,
    markdown: `
These terms apply to every order placed on this website. Please read them before ordering. The seller is the company named in the company details at the bottom of this page ("we", "us").

## 1. Who can buy

You must be at least 18 years old and live in the United Kingdom or a member state of the European Union. By ordering you confirm that this is the case.

## 2. Our products

Our products are intended for adults. Always read the label and the leaflet before use. Our products are not intended to diagnose, treat, cure or prevent any disease. If you have a medical condition, take medication or are unsure whether a product is suitable for you, consult a doctor or pharmacist before use. Stop using the product if you experience any irritation or allergic reaction.

Product images are for illustration. Packaging may differ slightly from the images shown.

## 3. Your account

You are responsible for keeping your login details confidential and for the accuracy of the delivery details you provide.

## 4. Orders and contract

Your order is an offer to buy. After payment you receive an order confirmation by email. The contract between you and us is formed when we send that confirmation. We may decline or cancel an order, for example if a product is unavailable, if there is an obvious pricing error or if we suspect fraud. If we cancel an order you have paid for, we refund you in full.

## 5. Prices and payment

Prices are shown in pounds sterling (GBP) for delivery to the United Kingdom and in euros (EUR) for delivery to the European Union. [Prices include VAT at the applicable rate.] Shipping costs are shown at checkout before you pay.

Payments are processed securely by Mollie B.V. We never see or store your full card details.

## 6. Delivery

We ship from the United Kingdom. Delivery times, costs and customs information are described in our [Shipping Policy](/legal/shipping). Risk in the goods passes to you when they are delivered to you or to a person you nominated.

## 7. Your right to cancel

You have a legal right to cancel your order within 14 days of receiving it. For hygiene and health protection reasons, this right ends once the seal of a product has been broken. Full details are in our [Returns & Cancellation Policy](/legal/returns).

## 8. Faulty or incorrect products

If a product is faulty, damaged or not as described, contact us and we will repair, replace or refund it in line with your statutory rights: in the UK under the Consumer Rights Act 2015, and in the EU under the consumer laws of your country. These terms do not affect your statutory rights.

## 9. Our liability

We are responsible for loss or damage you suffer that is a foreseeable result of our breach of these terms or our negligence. We do not exclude or limit our liability where it would be unlawful to do so, including for death or personal injury caused by our negligence, or for fraud. We are not responsible for loss caused by use of a product contrary to its instructions.

## 10. Complaints

If you are unhappy with your order, please contact us using the details below. We aim to reply within [3] working days.

## 11. Governing law

These terms are governed by the law of England and Wales. If you live in Scotland, Northern Ireland or the European Union, you also keep the protection of the mandatory consumer laws of the country where you live, and you may bring proceedings in your local courts.

## 12. Changes

We may update these terms from time to time. The version published at the time of your order applies to that order.
`,
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    footerOrder: 2,
    markdown: `
This policy explains how we collect and use your personal data when you visit our website, create an account or place an order. We are the data controller; our details are at the bottom of this page. We comply with the UK GDPR, the Data Protection Act 2018 and, for customers in the European Union, the EU General Data Protection Regulation (GDPR).

## Data we collect

- **Account data:** name, email address, password (stored encrypted), phone number.
- **Delivery data:** postal address and country.
- **Order data:** products bought, amounts, order history and status.
- **Payment data:** payment status and a payment reference from our payment provider. We do not receive or store your card details.
- **Marketing preferences:** whether you agreed to receive promotional emails, and when.
- **Technical data:** data strictly needed to run the website securely, such as a login cookie (see our [Cookie Policy](/legal/cookies)).

## Sensitive information

Because of the nature of our products, the fact that you buy from us could reveal information about your intimate life. We treat all order data as confidential, limit access to staff who need it to fulfil your order and ship every order in plain, unbranded packaging.

## Why we use your data and our legal basis

- **Creating your account, processing, delivering and supporting your orders, order and shipping emails:** performance of a contract.
- **Keeping accounting and tax records:** legal obligation.
- **Preventing fraud and keeping the website secure:** legitimate interests.
- **Sending offers and discounts by email:** your consent, which you can withdraw at any time.

## Who we share data with

We only share your data with service providers that help us run the shop, under contracts that protect your data:

- **Mollie B.V.** (Netherlands): payment processing
- **[Email provider, e.g. Resend]**: sending order and marketing emails
- **[Hosting provider]**: hosting the website and database
- **[Courier(s), e.g. Royal Mail, DHL]**: delivering your order
- **Customs authorities**: for orders shipped to the EU, the information required on customs declarations
- **[Accountant]**: bookkeeping and tax

We never sell your personal data.

## International transfers

We are based in the United Kingdom. Transfers between the UK and the EU are covered by adequacy decisions. Where a provider processes data outside the UK or EU (for example in the United States), we rely on appropriate safeguards such as the International Data Transfer Agreement / Standard Contractual Clauses or the UK–US data bridge.

## How long we keep data

- Order and invoice data: 6 years after the end of the financial year, as required by UK tax law.
- Account data: until you delete your account, then removed within [30] days except where we must keep order records.
- Marketing consent: until you unsubscribe.

## Your rights

You have the right to access your data, correct it, have it erased, restrict or object to its use, receive it in a portable format and withdraw consent at any time. To exercise a right, email us at the address below. You can unsubscribe from marketing emails via the link in every email or in your account.

You can complain to the UK Information Commissioner's Office (ico.org.uk) or, if you live in the EU, to the data protection authority of your country. Please contact us first so we can try to help.

## EU representative

[Name and address of our representative in the EU under Article 27 GDPR.]

## Age

Our website and products are for adults aged 18 or over. We do not knowingly collect data from anyone under 18.

## Changes

We may update this policy. The date of the latest update is shown on this page.
`,
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    footerOrder: 3,
    markdown: `
Cookies are small text files stored on your device. This policy explains which cookies we use. It complies with the UK Privacy and Electronic Communications Regulations (PECR) and the EU ePrivacy rules.

## Strictly necessary cookies

These cookies are needed for the website to work. They cannot be switched off and do not require consent.

- **payload-token:** keeps you logged in to your account. Duration: 30 days.
- **cookie_consent:** remembers your cookie choices. Duration: 6 months.

## Analytics cookies

Help us understand how visitors use the website so we can improve it. Only set if you accept them.

[No analytics cookies are used at the moment. List them here, e.g. Google Analytics _ga, if added.]

## Marketing cookies

Used to measure and personalise advertising. Only set if you accept them.

[No marketing cookies are used at the moment. List them here, e.g. Meta Pixel _fbp, if added.]

## Managing your choices

You can change your choices at any time with the **Cookie settings** link at the bottom of every page. You can also delete cookies in your browser settings; blocking strictly necessary cookies may stop parts of the website, such as your account, from working.
`,
  },
  {
    slug: 'returns',
    title: 'Returns & Cancellation',
    footerOrder: 4,
    markdown: `
## Your right to cancel

If you are a consumer in the UK or the EU, you can cancel your order without giving a reason within **14 days** of the day you (or someone you nominated) receive the goods. This right comes from the UK Consumer Contracts Regulations 2013 and the EU Consumer Rights Directive.

## Hygiene exception

Our products are personal care products. For health protection and hygiene reasons, **the right to cancel does not apply once a product's seal has been broken** after delivery. Unopened products in their original sealed packaging can be returned.

## How to cancel

Tell us within the 14 days by emailing us at the address below with your name, order number and the products you want to return. You can use the model form at the end of this page, but you do not have to.

Send the goods back within 14 days of telling us, to:

[RETURNS ADDRESS]

You pay the cost of returning the goods [unless they are faulty or not as described].

## Refunds

We refund the price you paid, including the standard delivery cost, within 14 days of receiving the goods back (or proof that you sent them back, if earlier). We refund using the same payment method you used. We may reduce the refund if the value of the goods has gone down because they were handled more than necessary.

## Faulty or wrong products

If a product arrives damaged, faulty or is not what you ordered, contact us within [30] days. We will replace it or refund you in full, including return costs. This is in addition to your statutory rights.

## Model cancellation form

To: [Company name, address and email]

I hereby give notice that I cancel my contract for the sale of the following goods:

- Ordered on / received on:
- Order number:
- Name:
- Address:
- Date:
`,
  },
  {
    slug: 'shipping',
    title: 'Shipping Policy',
    footerOrder: 5,
    markdown: `
## Where we ship

We ship from the United Kingdom to addresses in the United Kingdom and in all member states of the European Union.

## Discreet packaging

Every order is sent in plain packaging with no product names or branding on the outside.

## Delivery times and costs

- **United Kingdom:** dispatched within [1–2] working days, delivered in [1–3] working days.
- **European Union:** dispatched within [1–2] working days, delivered in [3–8] working days.

Shipping costs are shown at checkout before you pay.

Delivery times are estimates and can be longer during holidays or because of customs checks. You receive a tracking number by email once your order is shipped.

## Orders to the European Union: customs and VAT

Because we ship from the UK, orders to the EU are imports and pass through customs.

[OPTION A, if registered for IOSS: Our EU prices include EU VAT, which we collect at checkout under the Import One-Stop Shop (IOSS). You will not pay import VAT or customs charges on delivery for orders up to €150.]

[OPTION B, if not registered for IOSS: Import VAT and any customs charges are payable by you to the courier on delivery. The amount depends on your country.]

## Problems with delivery

If your parcel is late, lost or damaged, please contact us with your order number. We will investigate with the courier and, where the parcel is lost or damaged, send a replacement or refund you.

Please make sure your delivery address is correct. If a parcel is returned to us because the address was wrong or it was not collected, we can re-send it once the additional shipping cost is paid.
`,
  },
]

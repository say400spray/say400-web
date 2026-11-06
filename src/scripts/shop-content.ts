/**
 * Starting FAQ and product details. Everything in [BRACKETS] must be replaced
 * with real information from the client (in the admin) before launch.
 */
export const faqItems = [
  {
    question: 'How will my order be packaged?',
    answer:
      'Every order is sent in a plain, unbranded box. There is no product name, logo or description of the contents on the outside. The sender shown on the label is [NEUTRAL SENDER NAME].',
  },
  {
    question: 'What will appear on my bank statement?',
    answer: 'The payment appears as "[STATEMENT DESCRIPTOR]". The product name is never shown.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'We ship from the UK. Delivery usually takes [1–3] working days in the UK and [3–8] working days to EU countries. You receive a tracking number by email as soon as your order ships.',
  },
  {
    question: 'Do you deliver to my country?',
    answer: 'We deliver to the United Kingdom and to all 27 countries of the European Union.',
  },
  {
    question: 'Will I pay customs or VAT on EU orders?',
    answer:
      'Because we ship from the UK, EU orders pass through customs. Full details are in our Shipping Policy. [Update this answer once the IOSS decision is made.]',
  },
  {
    question: 'Is it safe to use?',
    answer:
      'Always read the leaflet before use. Our products are for adults only. If you have a medical condition, take medication or have allergies, ask a doctor or pharmacist first. Stop using the product if you notice any irritation.',
  },
  {
    question: 'Can I return my order?',
    answer:
      'Yes. Unopened products in their original sealed packaging can be returned within 14 days of delivery. For hygiene reasons, opened products cannot be returned unless they are faulty.',
  },
  {
    question: 'Is my personal data safe?',
    answer:
      'Yes. Payments are processed by Mollie, a licensed payment provider, and we never see your card details. We never sell or share your data for marketing. See our Privacy Policy for details.',
  },
  {
    question: 'Why do I need an account?',
    answer:
      'Your account keeps your delivery address for next time and lets you follow your orders. It takes less than a minute to create.',
  },
]

export const tibetSprayDetails = {
  size: '[20 ml · approx. 100 sprays]',
  highlights: [
    { text: 'Botanical formula with acmella, damiana, ginkgo and ginseng' },
    { text: 'Slim, pocket-size bottle' },
    { text: '[Key benefit from the official product information]' },
  ],
  howToUse: '[Directions for use, exactly as on the official leaflet.]',
  ingredients: '[Full ingredient list, exactly as on the packaging.]',
  warnings:
    'For external use only. For adults 18+ only. Do not use if you are allergic to any of the ingredients. Stop use if irritation occurs. Keep out of reach of children.\n[Add any further warnings from the official leaflet.]',
}

export const defaultAnnouncement =
  'Discreet, unbranded packaging · Ships from the UK to the UK & EU'

/**
 * The five Say400 boxes. They differ only in colour and strength: the strength (mg) of each
 * colour comes from the client and is filled in in the admin.
 */
export const sprayBoxes = [
  // lightest to strongest; levels and texts are placeholders until the client confirms the mg per colour
  {
    name: 'Rose',
    color: '#c47a9b',
    file: 'cutie-3',
    level: 'Gentle',
    description: 'Our lightest formula. A subtle feel, ideal for a first try.',
  },
  {
    name: 'Gold',
    color: '#d9b45e',
    file: 'cutie-1',
    level: 'Standard',
    description: 'The balanced, everyday choice and a good place to start.',
  },
  {
    name: 'Copper',
    color: '#b98266',
    file: 'cutie-4',
    level: 'Plus',
    description: 'A step up from Standard, for when you want a little more.',
  },
  {
    name: 'Red',
    color: '#c8323a',
    file: 'cutie-2',
    level: 'Intense',
    description: 'A stronger formula for a more noticeable feel.',
  },
  {
    name: 'Burgundy',
    color: '#8e2f2a',
    file: 'cutie-5',
    level: 'Maximum',
    description: 'Our strongest formula, for experienced users. Always patch-test first.',
  },
]

/** Product information printed on the box, used where the details are still placeholders. */
export const sprayBoxDetails = {
  size: '6 ml',
  ingredients: 'Acmella, Taurine, Damiana, Ginkgo Biloba, Ginseng',
  howToUse:
    'Spray a small amount (usually 2 to 5 pumps) directly onto the head and lower shaft of the penis.\nAlways patch-test a small amount first to check for allergic reactions or unwanted over-numbing.',
  warnings:
    'For external use only. Keep out of reach of children. Not for use by persons under 18 years of age. Discontinue use if irritation or an allergic reaction occurs.',
}

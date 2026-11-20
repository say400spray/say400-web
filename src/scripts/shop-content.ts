/**
 * Starting FAQ and product details. Everything in [BRACKETS] must be replaced
 * with real information from the client (in the admin) before launch.
 */
/** Questions about the product itself; they come first in the FAQ. */
export const productFaqItems = [
  {
    question: 'What is a delay spray?',
    answer:
      'A delay spray (also called a prolonger) is a spray for men that helps delay ejaculation so you can last longer in bed. The name comes from the Latin "prolongare", to lengthen. It gently reduces the sensitivity of the head of the penis for a while, so you keep control for longer.',
  },
  {
    question: 'How does Say400 work?',
    answer:
      'Many delay sprays use a local anaesthetic such as lidocaine or benzocaine. Say400 uses a botanical formula built around acmella, a plant known for its natural, mild numbing effect, with damiana, ginkgo biloba, ginseng and taurine. It slightly slows the nerve signals from the most sensitive area, so you stay in control without losing feeling.',
  },
  {
    question: 'How do I use it and how quickly does it work?',
    answer:
      'Apply 2–3 sprays to the head and lower shaft of the penis. Wait 2–5 minutes for the spray to absorb and take effect. Start with fewer sprays and add one more next time if you need it.',
  },
  {
    question: 'Will my partner feel the numbing effect?',
    answer:
      'Let the spray absorb fully for a few minutes before intimacy and do not use more than you need. This keeps the effect on you rather than your partner.',
  },
  {
    question: 'Can I use it with condoms?',
    answer:
      'Not every delay spray is suitable with latex. Always check the leaflet in the box before using Say400 with condoms or other latex products.',
  },
  {
    question: 'Does it help with premature ejaculation?',
    answer:
      'A delay spray helps you control when you climax and can make sex last longer, which is why many men with premature ejaculation use one. It does not treat the cause, such as stress or physical factors. If early ejaculation worries you, talk to a doctor.',
  },
  {
    question: 'Which strength should I choose?',
    answer:
      'If it is your first delay spray, start with Gentle or Standard. Move up to a stronger box only if you want a more noticeable effect. Each box has its own colour, so you always know which one is yours.',
  },
  {
    question: 'Is it safe to use?',
    answer:
      'Before the first use, do a patch test: apply a little to the inside of your elbow or thigh and wait a couple of hours. If there is no redness or itching, you can use it. Always read the leaflet. Our products are for adults 18+ only. If you have a medical condition, take medication or have allergies, ask a doctor or pharmacist first. Stop using it if you notice any irritation.',
  },
]

/** Product page texts for the Say400 Men Spray, in English, from the client's product information. */
export const sprayCopy = {
  shortDescription:
    'A discreet delay spray for men with a botanical formula. 2–3 sprays, works in 2–5 minutes, so you last longer and stay in control.',
  description:
    'Say400 Men Spray is a delay spray that helps you last longer in bed. Its botanical formula with acmella gently reduces sensitivity for a while, so you keep control without losing feeling.\nUse it whenever you want more time: after a long time apart, when you are very aroused, or simply to make the moment last for both of you. Five strengths, one slim pocket-size bottle, delivered in plain packaging.',
  highlights: [
    'Botanical formula with acmella, damiana, ginkgo and ginseng',
    'Works in 2–5 minutes, 2–3 sprays are usually enough',
    'Five strengths, from Gentle to Maximum',
    'Slim, pocket-size bottle',
  ],
  howToUse:
    'Apply 2–3 sprays to the head and lower shaft of the penis (up to 5 for a stronger effect).\nWait 2–5 minutes for the spray to absorb and take effect before intimacy.\nBefore the first use, patch-test a small amount on the inside of your elbow or thigh and wait a couple of hours to check for redness or itching.',
  warnings:
    'For external use only. For adults 18+ only. Keep out of reach of children. Do not use if you are allergic to any of the ingredients. Stop use if irritation or an allergic reaction occurs.\nCheck the leaflet before using with condoms or other latex products.\nA delay spray helps you control the moment; it does not treat the causes of premature ejaculation.',
}

export const faqItems = [
  ...productFaqItems,
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
      'Delivery is free to the UK and Europe, already included in the price. We ship from the UK. Delivery usually takes [1–3] working days in the UK and [3–8] working days to EU countries. You receive a tracking number by email as soon as your order ships.',
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
  'Free delivery to the UK & Europe · Discreet, unbranded packaging'

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
  howToUse: sprayCopy.howToUse,
  warnings: sprayCopy.warnings,
}

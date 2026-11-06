import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access'

/** The seller's legal identity; UK and EU law require it to be shown to customers. */
export const CompanyInfo: GlobalConfig = {
  slug: 'company-info',
  label: 'Company details',
  admin: {
    group: 'Content',
    description: 'Shown on every legal page and in the footer.',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'legalName', label: 'Registered company name', type: 'text' },
        { name: 'tradingName', type: 'text', defaultValue: 'Say400' },
      ],
    },
    { name: 'registeredAddress', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'companyNumber', label: 'Company number (Companies House)', type: 'text' },
        { name: 'vatNumber', label: 'UK VAT number', type: 'text' },
        { name: 'iossNumber', label: 'EU IOSS number', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', label: 'Customer service email', type: 'email' },
        { name: 'phone', type: 'text' },
      ],
    },
  ],
}

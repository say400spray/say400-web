import { cached } from '@/lib/cms'
import { getPayloadClient } from '@/lib/payload'

/** Seller identity block, required on legal pages (UK and EU distance selling rules). */
export async function CompanyDetails() {
  const payload = await getPayloadClient()
  const c = await cached(['company-info'], () => payload.findGlobal({ slug: 'company-info' }))

  return (
    <aside className="company-details">
      <h2>Company details</h2>
      <p>
        {c.legalName || '[Registered company name]'}
        {c.tradingName && ` trading as ${c.tradingName}`}
        <br />
        {(c.registeredAddress || '[Registered address]').split('\n').map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
        {c.companyNumber && (
          <>
            Company number: {c.companyNumber}
            <br />
          </>
        )}
        {c.vatNumber && (
          <>
            VAT number: {c.vatNumber}
            <br />
          </>
        )}
        {c.iossNumber && (
          <>
            IOSS number: {c.iossNumber}
            <br />
          </>
        )}
        Email: {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : '[Customer service email]'}
        {c.phone && (
          <>
            <br />
            Phone: {c.phone}
          </>
        )}
      </p>
    </aside>
  )
}

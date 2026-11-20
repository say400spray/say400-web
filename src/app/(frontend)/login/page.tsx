import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getCurrentCustomer } from '@/lib/payload'
import { safePath } from '@/lib/site'
import { loginAction } from '../actions'
import { ActionForm } from '../components/Forms'
import { PasswordInput } from '../components/PasswordInput'
import { privatePage } from '@/lib/seo'

export const metadata = privatePage('Log in')

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next = '' } = await searchParams
  if (await getCurrentCustomer()) redirect(safePath(next, '/account'))

  return (
    <section className="container section narrow">
      <h1>Log in</h1>
      <ActionForm action={loginAction} submitLabel="Log in">
        <input name="next" type="hidden" value={next} />
        <label>
          Email
          <input autoComplete="email" name="email" required type="email" />
        </label>
        <label>
          Password
          <PasswordInput autoComplete="current-password" name="password" required />
        </label>
      </ActionForm>
      <p className="muted">
        New here?{' '}
        <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}>
          Create an account
        </Link>
      </p>
    </section>
  )
}

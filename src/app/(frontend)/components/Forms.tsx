'use client'

import { startTransition, useActionState } from 'react'

import type { FormState } from '../actions'

type Action = (state: FormState, form: FormData) => Promise<FormState>

/** A form bound to a server action, showing its error / success message. */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = 'Please wait…',
  className,
}: {
  action: Action
  children?: React.ReactNode
  submitLabel: string
  pendingLabel?: string
  className?: string
}) {
  const [state, formAction, pending] = useActionState(action, {})

  // Once hydrated, onSubmit handles the submit so React does not clear the fields on errors.
  // `action` stays as the fallback: before hydration the browser POSTs to the server action
  // instead of a GET that would put the fields (passwords!) in the URL.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => formAction(data))
  }

  return (
    <form action={formAction} className={className ?? 'form'} onSubmit={onSubmit}>
      {children}
      {state.error && <p className="alert alert-error">{state.error}</p>}
      {state.success && <p className="alert alert-success">{state.success}</p>}
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  )
}

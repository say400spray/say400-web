export const ORDER_STATUSES = [
  { value: 'pending_payment', label: 'Awaiting payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]['value']

export function orderStatusLabel(status: string | null | undefined): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? String(status ?? '')
}

export function formatMoney(
  amount: number | null | undefined,
  currency: string | null = 'GBP',
): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency || 'GBP' }).format(
    amount ?? 0,
  )
}

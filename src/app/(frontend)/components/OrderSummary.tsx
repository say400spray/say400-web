import { addressLines } from '@/lib/countries'
import { formatMoney, orderStatusLabel } from '@/lib/orderStatus'
import type { Order } from '@/payload-types'

export function StatusBadge({ status }: { status: Order['status'] }) {
  return <span className={`badge badge-${status}`}>{orderStatusLabel(status)}</span>
}

export function OrderSummary({ order }: { order: Order }) {
  const money = (amount: number) => formatMoney(amount, order.currency)
  return (
    <div className="order-summary">
      <div className="order-summary-head">
        <div>
          <p className="muted">Order</p>
          <p className="order-number">{order.orderNumber}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <table className="order-table">
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.name} × {item.quantity}
              </td>
              <td>{item.unitPrice ? money(item.unitPrice * item.quantity) : 'Free'}</td>
            </tr>
          ))}
          {(order.discount ?? 0) > 0 && (
            <tr>
              <td>First-order discount</td>
              <td>−{money(order.discount!)}</td>
            </tr>
          )}
          <tr>
            <td>Shipping</td>
            <td>{order.shippingFee ? money(order.shippingFee) : 'Free'}</td>
          </tr>
          <tr className="total">
            <td>Total</td>
            <td>{money(order.total)}</td>
          </tr>
        </tbody>
      </table>

      <div className="order-summary-grid">
        <div>
          <h3>Delivery address</h3>
          <p>
            {addressLines(order.shippingAddress).map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>
        {order.shipment?.trackingNumber && (
          <div>
            <h3>Tracking</h3>
            <p>
              {order.shipment.carrier}
              <br />
              <strong>{order.shipment.trackingNumber}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

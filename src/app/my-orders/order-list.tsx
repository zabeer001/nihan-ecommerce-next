"use client";

import Link from "next/link";
import { formatPrice } from "../money";
import { trackingHref, useSavedOrders } from "./saved-orders";

const orderDate = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeZone: "Asia/Dhaka",
});

export function OrderList() {
  const orders = useSavedOrders();
  if (!orders) return <p role="status">Loading orders…</p>;

  if (!orders.length) return (
    <div className="commerce-panel commerce-narrow">
      <h2>No saved orders</h2>
      <p>New orders appear here after checkout. Open an older order’s private tracking link to add it.</p>
      <Link className="btn fill" href="/products">Browse products</Link>
    </div>
  );

  return (
    <ul className="saved-order-list">
      {orders.map(order => (
        <li key={order.reference} className="commerce-panel saved-order">
          <div>
            <h2>Order #{order.reference}</h2>
            {order.placedAt && Number.isFinite(Date.parse(order.placedAt)) && <time className="commerce-muted" dateTime={order.placedAt}>
              {orderDate.format(new Date(order.placedAt))}
            </time>}
          </div>
          <dl className="saved-order-summary">
            <div><dt className="commerce-muted">Last checked status</dt><dd>{order.status}</dd></div>
            <div><dt className="commerce-muted">Total</dt><dd>{formatPrice(order.totalCents)}</dd></div>
          </dl>
          <Link className="btn" href={trackingHref(order.secret)} prefetch={false} aria-label={`Track order #${order.reference}`}>Track order</Link>
        </li>
      ))}
    </ul>
  );
}

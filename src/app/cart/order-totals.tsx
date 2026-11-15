import { formatPrice } from "../money";
import type { Quote, Receipt } from "./commerce-api";

export function OrderTotals({ totals }: { totals: Quote | Receipt }) {
  return (
    <dl className="order-totals">
      <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal_cents)}</dd></div>
      <div><dt>Delivery</dt><dd>{totals.delivery_cents ? formatPrice(totals.delivery_cents) : "Free"}</dd></div>
      <div><dt>Total</dt><dd>{formatPrice(totals.total_cents)}</dd></div>
    </dl>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "../money";
import { MAX_QUANTITY, setCartQuantity, useCart } from "./cart-store";
import { lineIssue, useQuote } from "./commerce-api";
import { QuoteTracking } from "../ecommerce-tracking";
import { OrderTotals } from "./order-totals";

function Quantity({ id, quantity, name }: { id: number; quantity: number; name: string }) {
  const [value, setValue] = useState(String(quantity));
  function update() {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 1 || next > MAX_QUANTITY) {
      setValue(String(quantity));
      return;
    }
    if (next !== quantity) setCartQuantity(id, next);
  }
  return (
    <input className="commerce-input commerce-quantity" type="number" min={1} max={MAX_QUANTITY}
      aria-label={`Quantity for ${name}`} value={value} onChange={event => setValue(event.target.value)}
      onBlur={update} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} />
  );
}

export function CartPage() {
  const cart = useCart();
  const { quote, error, loading, retry } = useQuote(cart);

  if (!cart.length) return <div className="commerce-panel commerce-narrow"><p>Your cart is empty.</p><Link className="btn fill" href="/products">Browse products</Link></div>;

  return (
    <div className="commerce-grid">
      <QuoteTracking event="view_cart" quote={quote} />
      <ul className="commerce-panel cart-lines">
        {cart.map(item => {
          const line = quote?.items.find(line => line.variant_id === item.variant_id);
          const name = line?.name ?? item.name;
          const attributes = Object.entries(line?.attributes ?? {});
          const label = line?.label ?? item.label;
          const variant = label !== line?.sku && label !== attributes.map(([, value]) => value).join(" / ") ? label : "";
          const lineName = [name, item.label || line?.sku].filter(Boolean).join(" ");
          return (
            <li key={item.variant_id} className="cart-line">
              <div className="cart-line-product">
                {line?.image_url && <Image className="cart-line-image" src={line.image_url}
                  alt="" width={64} height={64} unoptimized />}
                <div className="cart-line-details">
                  <Link href={`/products/${encodeURIComponent(line?.slug ?? item.slug)}`}>{name}</Link>
                  {variant && <p className="commerce-muted">{variant}</p>}
                  {line?.sku && <p className="commerce-muted">SKU {line.sku}</p>}
                  {attributes.length > 0 && <dl className="cart-line-attributes commerce-muted">
                    {attributes.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
                  </dl>}
                  {line?.price_cents != null && <p className="commerce-muted">{formatPrice(line.price_cents)} each</p>}
                  {line?.issue && <p className="commerce-notice" role="status">{lineIssue(line.issue)}</p>}
                </div>
              </div>
              <Quantity key={item.quantity} id={item.variant_id} quantity={item.quantity} name={lineName} />
              <div className="cart-line-price">
                {line?.total_cents != null && <><span className="commerce-muted">Line total</span><span>{formatPrice(line.total_cents)}</span></>}
                <button type="button" className="commerce-text-button" aria-label={`Remove ${lineName}`}
                  onClick={() => setCartQuantity(item.variant_id, 0)}>Remove</button>
              </div>
            </li>
          );
        })}
      </ul>
      <aside className="commerce-panel">
        <h2>Order summary</h2>
        {loading && <p role="status">Checking availability and prices…</p>}
        {error && <p role="alert">{error} <button type="button" className="commerce-text-button" onClick={retry}>Try again</button></p>}
        {quote?.available && <>
          <OrderTotals totals={quote} />
          <Link className="btn fill" href="/checkout">Checkout</Link>
        </>}
        {quote && !quote.available && <p>Update the affected items to continue.</p>}
        <Link className="commerce-secondary-link" href="/products">Continue shopping</Link>
      </aside>
    </div>
  );
}

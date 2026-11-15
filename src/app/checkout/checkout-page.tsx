"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { removePurchasedItems, useCart } from "../cart/cart-store";
import { lineIssue, requestCommerce, useQuote, type LineInput, type Receipt } from "../cart/commerce-api";
import { OrderTotals } from "../cart/order-totals";
import { formatPrice } from "../money";
import { saveOrder, trackingHref } from "../my-orders/saved-orders";

const attemptKey = "nihan-cod-attempt-v1";
const contactFields = ["customer_name", "phone", "email", "address"] as const;

type Attempt = {
  submission_key: string;
  tracking_secret: string;
  items: LineInput[];
};

type OrderPayload = {
  submission_key: string;
  tracking_secret: string;
  items: (LineInput & { price_cents: number })[];
  delivery_cents: number;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
};

function restoreAttempt(): Attempt | undefined {
  try {
    const attempt = JSON.parse(sessionStorage.getItem(attemptKey) ?? "null") as Attempt | null;
    if (attempt && /^[\da-f-]{36}$/.test(attempt.submission_key)
      && /^[\da-f]{64}$/.test(attempt.tracking_secret) && Array.isArray(attempt.items)) return attempt;
  } catch {
    // Checkout is usable when session storage is unavailable.
  }
}

function saveAttempt(attempt?: Attempt) {
  try {
    if (attempt) sessionStorage.setItem(attemptKey, JSON.stringify(attempt));
    else sessionStorage.removeItem(attemptKey);
  } catch {
    // The active checkout can still retry using its in-memory request.
  }
}

function confirmOrder(attempt: Attempt, receipt: Receipt) {
  saveOrder(receipt, attempt.tracking_secret);
  saveAttempt();
  removePurchasedItems(attempt.items);
  return { receipt, secret: attempt.tracking_secret };
}

function Confirmation({ receipt, secret }: { receipt: Receipt; secret: string }) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");
  const trackPath = trackingHref(secret);

  async function copyLink() {
    const url = new URL(trackPath, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setLink(url);
    }
  }

  return (
    <div className="commerce-panel commerce-narrow">
      <h2>Order #{receipt.reference}</h2>
      <p>Your cash on delivery order was received. Save your private link to check its status.</p>
      <p><strong>Status</strong> {receipt.status}</p>
      <OrderTotals totals={receipt} />
      <div className="commerce-actions">
        <Link className="btn fill" href={trackPath} prefetch={false}>Track order</Link>
        <Link className="btn" href="/my-orders">My Orders</Link>
        <button type="button" className="btn" onClick={copyLink}>{copied ? "Link copied" : "Copy tracking link"}</button>
      </div>
      {link && <input className="commerce-input" readOnly value={link} aria-label="Private tracking link" onFocus={event => event.currentTarget.select()} />}
    </div>
  );
}

export function CheckoutPage() {
  const cart = useCart();
  const { quote, loading, error: quoteError, updateQuote, retry } = useQuote(cart);
  const active = useRef(false);
  const attemptRef = useRef<Attempt | undefined>(undefined);
  const [pendingPayload, setPendingPayload] = useState<OrderPayload>();
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmation, setConfirmation] = useState<{ receipt: Receipt; secret: string }>();

  useEffect(() => {
    const attempt = restoreAttempt();
    if (!attempt) return;
    attemptRef.current = attempt;
    const controller = new AbortController();
    requestCommerce<Receipt>("tracking", { tracking_secret: attempt.tracking_secret }, controller.signal)
      .then(result => {
        if (controller.signal.aborted || attemptRef.current !== attempt || active.current) return;
        if (result.data) {
          attemptRef.current = undefined;
          setConfirmation(confirmOrder(attempt, result.data));
        } else setUncertain(true);
      })
      .catch(() => { if (!controller.signal.aborted && !active.current) setUncertain(true); });
    return () => controller.abort();
  }, []);

  async function recover() {
    const attempt = attemptRef.current;
    if (!attempt) return false;
    const result = await requestCommerce<Receipt>("tracking", { tracking_secret: attempt.tracking_secret });
    if (result.data) {
      attemptRef.current = undefined;
      setPendingPayload(undefined);
      setConfirmation(confirmOrder(attempt, result.data));
      return true;
    }
    if (result.status !== 404) throw new Error(result.error?.message ?? "Could not check the order.");
    return false;
  }

  async function checkOrder() {
    if (active.current) return;
    active.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (!await recover()) setMessage("No confirmation yet. Retry from this checkout to avoid submitting a duplicate order.");
    } catch {
      setMessage("Could not check the order. Please try again.");
    } finally {
      active.current = false;
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active.current || (!pendingPayload && !quote?.available)) return;
    const fields = new FormData(event.currentTarget);
    active.current = true;
    setBusy(true);
    setMessage("");
    setErrors({});

    try {
      if (attemptRef.current && await recover()) return;
      const recoveringAfterReload = Boolean(attemptRef.current && !pendingPayload);
      let payload = pendingPayload;
      if (!payload && quote?.available) {
        const items = quote.items.map(line => ({
          variant_id: line.variant_id,
          quantity: line.quantity,
          price_cents: line.price_cents!,
        }));
        const previous = attemptRef.current;
        const quantities = new Map(items.map(({ variant_id, quantity }) => [variant_id, quantity]));
        if (previous && (quantities.size !== previous.items.length
          || previous.items.some(item => quantities.get(item.variant_id) !== item.quantity))) {
          setUncertain(true);
          setMessage("Restore the previous cart quantities to retry this order, or check whether it was received.");
          return;
        }

        const attempt = previous ?? {
          submission_key: crypto.randomUUID(),
          tracking_secret: Array.from(
            crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, "0"),
          ).join(""),
          items: items.map(({ variant_id, quantity }) => ({ variant_id, quantity })),
        };
        payload = {
          submission_key: attempt.submission_key,
          tracking_secret: attempt.tracking_secret,
          items,
          delivery_cents: quote.delivery_cents,
          customer_name: String(fields.get("customer_name")).trim(),
          phone: String(fields.get("phone")).replace(/[\s-]/g, ""),
          email: String(fields.get("email")).trim() || null,
          address: String(fields.get("address")).trim(),
        };
        attemptRef.current = attempt;
        setPendingPayload(payload);
        saveAttempt(attempt);
      }
      const attempt = attemptRef.current;
      if (!attempt || !payload) return;

      const result = await requestCommerce<Receipt>("orders", payload);
      if (result.data) {
        attemptRef.current = undefined;
        setPendingPayload(undefined);
        setConfirmation(confirmOrder(attempt, result.data));
        return;
      }

      if (result.status === 409 || result.status === 422) {
        setPendingPayload(undefined);
        const retryUncertain = Boolean(result.error?.errors?.submission_key)
          || (recoveringAfterReload && result.status === 422 && !result.error?.errors?.tracking_secret);
        if (!retryUncertain) {
          attemptRef.current = undefined;
          saveAttempt();
        }
        setUncertain(retryUncertain);
        setErrors(result.error?.errors ?? {});
        if (result.error?.quote) updateQuote(result.error.quote);
        setMessage(result.error?.message ?? "Please review your order details.");
        return;
      }

      setUncertain(true);
      setMessage(result.error?.message ?? "Order confirmation is unavailable. Check its status or retry the same order.");
    } catch {
      setUncertain(Boolean(attemptRef.current));
      setMessage("Could not confirm your order. Check its status or retry from this checkout.");
    } finally {
      active.current = false;
      setBusy(false);
    }
  }

  if (confirmation) return <Confirmation {...confirmation} />;

  const recovery = uncertain && (
    <div className="commerce-notice">
      <p>A previous checkout attempt is awaiting confirmation.</p>
      <button type="button" className="commerce-text-button" onClick={checkOrder} disabled={busy}>Check previous order</button>
    </div>
  );

  if (!cart.length) return (
    <div className="commerce-panel commerce-narrow">
      {recovery}
      {message && <p role="status">{message}</p>}
      <p>Your cart is empty.</p>
      <Link className="btn fill" href="/products">Browse products</Link>
    </div>
  );

  return (
    <form className="commerce-grid" onSubmit={submit}>
      <div className="commerce-panel">
        <Link className="commerce-secondary-link" href="/cart">Back to cart</Link>
        <h2>Delivery details</h2>
        <fieldset className="checkout-fields" disabled={busy || (uncertain && Boolean(pendingPayload))}>
          {contactFields.map(name => {
            const labels = { customer_name: "Full name", phone: "Mobile number", email: "Email (optional)", address: "Delivery address" };
            const fieldProps = {
              className: "commerce-input", name, id: name, required: name !== "email",
              "aria-invalid": errors[name] ? true : undefined,
              "aria-describedby": errors[name] ? `${name}-error` : undefined,
            };
            return <div key={name}>
              <label htmlFor={name}>{labels[name]}</label>
              {name === "address"
                ? <textarea {...fieldProps} autoComplete="street-address" maxLength={2000} rows={4} />
                : <input {...fieldProps} maxLength={name === "phone" ? 40 : 255}
                    type={name === "customer_name" ? "text" : name === "phone" ? "tel" : "email"}
                    autoComplete={{ customer_name: "name", phone: "tel", email: "email" }[name]} />}
              {errors[name] && <p className="commerce-notice" id={`${name}-error`}>{errors[name][0]}</p>}
            </div>;
          })}
        </fieldset>
      </div>
      <aside className="commerce-panel">
        <h2>Order summary</h2>
        <p className="commerce-muted">Payment on delivery</p>
        {loading && <p role="status">Checking availability and prices…</p>}
        {quoteError && <p role="alert">{quoteError} <button type="button" className="commerce-text-button" onClick={retry}>Try again</button></p>}
        {quote && <>
          <ul className="checkout-lines">
            {quote.items.map(line => <li key={line.variant_id}>
              <div>
                {line.name ?? cart.find(item => item.variant_id === line.variant_id)?.name} × {line.quantity}
                {cart.find(item => item.variant_id === line.variant_id)?.label && <p className="commerce-muted">{line.label}</p>}
                {line.issue && <p className="commerce-notice">{lineIssue(line.issue)}</p>}
              </div>
              {line.total_cents != null && <span>{formatPrice(line.total_cents)}</span>}
            </li>)}
          </ul>
          {quote.available ? <OrderTotals totals={quote} /> : <p>Go back to the cart to update the affected items.</p>}
        </>}
        {recovery}
        {message && <p className="commerce-notice" role="alert">{message}</p>}
        <button className="btn fill" type="submit" disabled={busy || (!quote?.available && !pendingPayload)}>
          {busy ? "Checking order…" : uncertain && pendingPayload ? "Retry COD order" : "Place COD order"}
        </button>
      </aside>
    </form>
  );
}

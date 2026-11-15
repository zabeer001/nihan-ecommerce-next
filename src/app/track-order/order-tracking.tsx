"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { requestCommerce, type Receipt } from "../cart/commerce-api";
import { OrderTotals } from "../cart/order-totals";
import { isTrackingSecret, saveOrder } from "../my-orders/saved-orders";

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

export function OrderTracking() {
  const secret = useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => "");
  const valid = isTrackingSecret(secret);
  const [refresh, setRefresh] = useState(0);
  const [state, setState] = useState<{ secret: string; receipt?: Receipt; error?: string }>();

  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    requestCommerce<Receipt>("tracking", { tracking_secret: secret }, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        if (result.data) saveOrder(result.data, secret);
        setState({ secret, receipt: result.data, error: result.error?.message });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ secret, error: "Could not load the order. Please try again." });
      });
    return () => controller.abort();
  }, [secret, valid, refresh]);

  if (!valid) return <p>Open the private tracking link you saved after placing your order.</p>;

  const current = state?.secret === secret ? state : undefined;
  const receipt = current?.receipt;
  return (
    <>
      {!current && <p role="status">Checking order status…</p>}
      {current?.error && <p role="alert">{current.error}</p>}
      {receipt && <>
        <h2>Order #{receipt.reference}</h2>
        <p><strong>Status</strong> {receipt.status}</p>
        <p className="commerce-muted">Payment on delivery</p>
        <OrderTotals totals={receipt} />
        <h3>Status history</h3>
        <ol className="order-history">
          {receipt.history.map(({ status, created_at }) => <li key={status}>
            <strong>{status}</strong>
            <time dateTime={created_at}>{new Date(created_at).toLocaleString("en-BD", {
              dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
            })}</time>
          </li>)}
        </ol>
      </>}
      {current && <button className="btn" type="button" onClick={() => {
        setState(undefined);
        setRefresh(count => count + 1);
      }}>Refresh status</button>}
    </>
  );
}

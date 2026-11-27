"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ecommerceEvent, type EcommerceItem } from "./data-layer";
import type { Quote } from "./cart/commerce-api";

export function quoteItems(quote: Quote): EcommerceItem[] {
  return quote.items.filter(item => !item.issue && item.price_cents !== null).map(item => ({
    item_id: String(item.variant_id), item_name: item.name || item.slug || String(item.variant_id),
    item_variant: item.label || undefined, price: item.price_cents! / 100, quantity: item.quantity,
  }));
}

export function QuoteTracking({ event, quote }: { event: "view_cart" | "begin_checkout"; quote?: Quote }) {
  const sent = useRef("");
  useEffect(() => {
    if (!quote?.available) return;
    const items = quoteItems(quote);
    const key = JSON.stringify(items);
    if (sent.current === key) return;
    sent.current = key;
    ecommerceEvent(event, items);
  }, [event, quote]);
  return null;
}


export function PageTracking() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      // Only the path is shared: private tracking tokens and query strings are excluded.
      window.dataLayer.push({ event: "page_view", page_path: pathname });
    } catch { /* Analytics must not interrupt navigation. */ }
  }, [pathname]);
  return null;
}

"use client";

import { useEffect, useState } from "react";
import type { CartLine } from "./cart-store";

export type LineInput = Pick<CartLine, "variant_id" | "quantity">;

type QuoteLine = LineInput & {
  name: string | null;
  label: string | null;
  slug: string | null;
  sku: string | null;
  attributes: Record<string, string> | null;
  image_url: string | null;
  price_cents: number | null;
  total_cents: number | null;
  issue: "unavailable" | "insufficient_stock" | null;
};

type Totals = {
  subtotal_cents: number;
  delivery_cents: number;
  total_cents: number;
};

export type Quote = Totals & { items: QuoteLine[]; available: boolean };
export type Receipt = Totals & {
  reference: number;
  status: string;
  history: { status: string; created_at: string }[];
};

export type CommerceError = {
  message?: string;
  errors?: Record<string, string[]>;
  quote?: Quote;
};

export async function requestCommerce<T>(action: "quote" | "orders" | "tracking", body: unknown, signal?: AbortSignal) {
  const response = await fetch(`/api/storefront/${action}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
    cache: "no-store",
  });

  if (response.ok) return { data: await response.json() as T, status: response.status };
  const error: CommerceError = await response.json().catch(() => ({}));
  return { error, status: response.status };
}

type QuoteState = { key: string; quote?: Quote; error?: string };

export function useQuote(cart: CartLine[]) {
  const key = JSON.stringify(cart.map(({ variant_id, quantity }) => ({ variant_id, quantity })));
  const [state, setState] = useState<QuoteState>();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (key === "[]") return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const result = await requestCommerce<Quote>("quote", { items: JSON.parse(key) }, controller.signal);
        if (!controller.signal.aborted) setState({ key, quote: result.data, error: result.error?.message });
      } catch {
        if (!controller.signal.aborted) setState({ key, error: "Could not load current prices. Please try again." });
      }
    }, 150);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key, refresh]);

  const current = state?.key === key ? state : undefined;
  return {
    quote: current?.quote,
    error: current?.error,
    loading: key !== "[]" && !current,
    updateQuote: (quote: Quote) => setState({ key, quote }),
    retry: () => {
      setState(undefined);
      setRefresh(count => count + 1);
    },
  };
}

export function lineIssue(issue: QuoteLine["issue"]) {
  return issue === "unavailable" ? "No longer available"
    : issue === "insufficient_stock" ? "Requested quantity is no longer available"
      : "";
}

"use client";

import { useSyncExternalStore } from "react";
import { ecommerceEvent } from "../data-layer";

export const MAX_CART_LINES = 100;
export const MAX_QUANTITY = 1_000_000;

export type CartLine = {
  variant_id: number;
  quantity: number;
  name: string;
  label: string;
  slug: string;
  price_cents?: number;
};

const storageKey = "nihan-cart-v1";
const empty: CartLine[] = [];
let cart = empty;
let stored: string | null = null;
let memoryOnly = false;
const listeners = new Set<() => void>();

function isCartLine(line: unknown): line is CartLine {
  if (!line || typeof line !== "object") return false;
  const item = line as CartLine;
  return Number.isSafeInteger(item.variant_id) && item.variant_id > 0
    && Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= MAX_QUANTITY
    && typeof item.name === "string" && typeof item.label === "string" && typeof item.slug === "string";
}

function snapshot() {
  if (memoryOnly) return cart;
  try {
    const value = localStorage.getItem(storageKey);
    if (value === stored) return cart;
    stored = value;
    const parsed: unknown = value ? JSON.parse(value) : [];
    cart = Array.isArray(parsed)
      ? [...new Map(parsed.filter(isCartLine).map(line => [line.variant_id, line])).values()].slice(0, MAX_CART_LINES)
      : empty;
  } catch {
    cart = empty;
  }
  return cart;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function save(lines: CartLine[]) {
  cart = lines;
  stored = JSON.stringify(lines);
  try {
    localStorage.setItem(storageKey, stored);
  } catch {
    memoryOnly = true;
  }
  listeners.forEach(listener => listener());
}

export function useCart() {
  return useSyncExternalStore(subscribe, snapshot, () => empty);
}

function trackChange(event: string, line: CartLine, quantity: number) {
  if (!Number.isSafeInteger(line.price_cents) || line.price_cents! < 0) return;
  ecommerceEvent(event, [{ item_id: String(line.variant_id), item_name: line.name,
    item_variant: line.label || undefined, price: line.price_cents! / 100, quantity }]);
}

export function addToCart(line: CartLine) {
  if (!isCartLine(line)) return false;
  const lines = snapshot();
  const existing = lines.find(item => item.variant_id === line.variant_id);
  if (existing) {
    const quantity = existing.quantity + line.quantity;
    if (quantity > MAX_QUANTITY) return false;
    save(lines.map(item => item.variant_id === line.variant_id ? { ...line, quantity } : item));
  } else {
    if (lines.length >= MAX_CART_LINES) return false;
    save([...lines, line]);
  }
  trackChange("add_to_cart", line, line.quantity);
  return true;
}

export function setCartQuantity(variantId: number, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) return;
  save(snapshot().flatMap(line => {
    if (line.variant_id !== variantId) return [line];
    const delta = quantity - line.quantity;
    if (delta) trackChange(delta > 0 ? "add_to_cart" : "remove_from_cart", line, Math.abs(delta));
    return quantity > 0 ? [{ ...line, quantity }] : [];
  }));
}

export function removePurchasedItems(items: Pick<CartLine, "variant_id" | "quantity">[]) {
  const quantities = new Map(items.map(item => [item.variant_id, item.quantity]));
  save(snapshot().flatMap(line => {
    const quantity = line.quantity - (quantities.get(line.variant_id) ?? 0);
    return quantity > 0 ? [{ ...line, quantity }] : [];
  }));
}

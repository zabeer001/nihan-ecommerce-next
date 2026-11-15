"use client";

import { useSyncExternalStore } from "react";

export const MAX_CART_LINES = 100;
export const MAX_QUANTITY = 1_000_000;

export type CartLine = {
  variant_id: number;
  quantity: number;
  name: string;
  label: string;
  slug: string;
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

export function addToCart(line: CartLine) {
  if (!isCartLine(line)) return false;
  const lines = snapshot();
  const existing = lines.find(item => item.variant_id === line.variant_id);
  if (existing) {
    const quantity = existing.quantity + line.quantity;
    if (quantity > MAX_QUANTITY) return false;
    setCartQuantity(line.variant_id, quantity);
  } else {
    if (lines.length >= MAX_CART_LINES) return false;
    save([...lines, line]);
  }
  return true;
}

export function setCartQuantity(variantId: number, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) return;
  save(snapshot().flatMap(line => {
    if (line.variant_id !== variantId) return [line];
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

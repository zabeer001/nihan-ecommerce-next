"use client";

import { useSyncExternalStore } from "react";
import type { Receipt } from "../cart/commerce-api";

const storagePrefix = "nihan-order-v1:";

type SavedOrder = {
  reference: number;
  secret: string;
  placedAt: string | null;
  totalCents: number;
  status: string;
  eventCount: number;
};

export function isTrackingSecret(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export function trackingHref(secret: string) {
  return `/track-order/#${secret}`;
}

function readOrder(value: string | null): SavedOrder | undefined {
  try {
    const order = JSON.parse(value ?? "null") as SavedOrder | null;
    if (order && Number.isSafeInteger(order.reference) && order.reference > 0
      && isTrackingSecret(order.secret) && typeof order.status === "string"
      && Number.isFinite(order.totalCents) && Number.isInteger(order.eventCount)
      && (order.placedAt === null || typeof order.placedAt === "string")) return order;
  } catch {
    // A broken entry does not prevent other orders from loading.
  }
}

export function saveOrder(receipt: Receipt, secret: string) {
  if (!isTrackingSecret(secret)) return;

  try {
    const key = `${storagePrefix}${receipt.reference}`;
    const previous = readOrder(localStorage.getItem(key));
    if (previous && previous.eventCount > receipt.history.length) return;

    const order: SavedOrder = {
      reference: receipt.reference,
      secret,
      placedAt: receipt.history[0]?.created_at ?? null,
      totalCents: receipt.total_cents,
      status: receipt.status,
      eventCount: receipt.history.length,
    };
    localStorage.setItem(key, JSON.stringify(order));
  } catch {
    // Private tracking links still work if browser storage is unavailable.
  }
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === null || event.key.startsWith(storagePrefix)) listener();
  }

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function snapshot() {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(storagePrefix)).sort();
    return JSON.stringify(keys.map(key => localStorage.getItem(key)));
  } catch {
    return "[]";
  }
}

export function useSavedOrders() {
  const items = useSyncExternalStore(subscribe, snapshot, () => null);
  if (items === null) return null;

  return (JSON.parse(items) as (string | null)[])
    .map(readOrder)
    .filter(order => order !== undefined)
    .sort((first, second) => second.reference - first.reference);
}

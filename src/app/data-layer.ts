export type EcommerceItem = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

declare global {
  interface Window { dataLayer: Record<string, unknown>[]; }
}

export function ecommerceEvent(event: string, items: EcommerceItem[], extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !items.length) return;
  // Analytics must never interrupt cart changes or order confirmation.
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event, ecommerce: {
      currency: "BDT",
      value: Math.round(items.reduce((total, item) => total + item.price * item.quantity, 0) * 100) / 100,
      items, ...extra,
    } });
  } catch { /* A third-party tag must not block commerce. */ }
}

const purchases = new Set<string>();
export function purchaseEvent(reference: number, items: EcommerceItem[], subtotal: number, shipping: number) {
  const id = String(reference);
  const key = `nihan-purchase-${id}`;
  if (!items.length || purchases.has(id)) return;
  try { if (sessionStorage.getItem(key)) return; } catch { /* Use in-memory deduplication. */ }
  ecommerceEvent("purchase", items, { transaction_id: id, value: subtotal / 100, shipping: shipping / 100 });
  purchases.add(id);
  try { sessionStorage.setItem(key, "1"); } catch { /* In-memory deduplication remains active. */ }
}

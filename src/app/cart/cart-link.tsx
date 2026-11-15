"use client";

import Link from "next/link";
import { useCart } from "./cart-store";

export function CartLink() {
  const count = useCart().reduce((total, item) => total + item.quantity, 0);
  return (
    <Link className="cart-link" href="/cart" aria-label={`Cart${count ? ` (${count} ${count === 1 ? "item" : "items"})` : ""}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {count > 0 && <span className="cart-badge" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}

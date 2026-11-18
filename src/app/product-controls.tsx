"use client";

import type { ComponentProps } from "react";

export function AddToCartButton({ className = "", type = "button", children = "Add to cart", ...props }: ComponentProps<"button">) {
  return <button {...props} type={type} className={`product-control cart-add-button ${className}`}>{children}</button>;
}

export function VariationSelect({ className = "", ...props }: ComponentProps<"select">) {
  return <select {...props} className={`product-control variation-select ${className}`} />;
}

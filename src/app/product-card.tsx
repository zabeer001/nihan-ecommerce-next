"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CatalogPage } from "./catalog-api";
import { ProductPrice } from "./product-price";
import { AddToCartButton, VariationSelect } from "./product-controls";
import { addToCart } from "./cart/cart-store";

export function ProductCard({
  product,
  heading: Heading = "h3",
}: {
  product: CatalogPage["data"][number];
  heading?: "h3" | "h4";
}) {
  const { slug, name, image, variants } = product;
  const [selected, setSelected] = useState(() => Math.max(0, variants.findIndex(variant => variant.in_stock)));
  const [feedback, setFeedback] = useState<"added" | "limit" | null>(null);
  const variant = variants[selected];
  const href = `/products/${encodeURIComponent(slug)}`;

  function add() {
    if (!variant?.in_stock) return;
    const added = addToCart({ variant_id: variant.id, quantity: 1, slug, name, label: variants.length > 1 ? variant.label : "" });
    setFeedback(added ? "added" : "limit");
  }

  return (
    <article className="tile">
      <div className="tile-art">
        <Link className="tile-image-link" href={href} aria-label={`View ${name}`}>
          {image && <Image src={image.url} alt="" fill unoptimized className="cover" />}
        </Link>
        <div className="tile-cart-overlay">
          {variants.length > 1 && <label className="tile-variant-label"><span className="visually-hidden">Choose a variant for {name}</span>
            <VariationSelect aria-label={`Variant for ${name}`} value={selected} onChange={event => { setSelected(Number(event.target.value)); setFeedback(null); }}>
              {variants.map((option, index) => <option key={option.id} value={index} disabled={!option.in_stock}>{option.label}{!option.in_stock ? " · Sold out" : ""}</option>)}
            </VariationSelect>
          </label>}
          <AddToCartButton className="tile-cart-button" type="button" disabled={!variant?.in_stock} onClick={add}
            aria-label={variant?.in_stock ? `Add ${name}${variants.length > 1 ? ` (${variant.label})` : ""} to cart` : `${name} is sold out`}>
            {!variant?.in_stock ? "Sold out" : feedback === "added" ? "Added ✓" : "Add to cart"}
          </AddToCartButton>
        </div>
      </div>
      <Link href={href}>
        <Heading>{name}</Heading>
        <p><ProductPrice price={variant?.price_cents ?? product.price_cents} original={variant ? variant.compare_at_price_cents : product.compare_at_price_cents} /></p>
      </Link>
      <div className="tile-cart-feedback" role="status">
        {feedback === "added" && <>Added to cart. <Link href="/cart">View cart</Link></>}
        {feedback === "limit" && "The cart has reached its item or quantity limit."}
      </div>
    </article>
  );
}

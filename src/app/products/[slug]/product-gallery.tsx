"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProductPrice } from "../../product-price";
import { AddToCartButton, VariationSelect } from "../../product-controls";
import { addToCart, MAX_QUANTITY } from "../../cart/cart-store";
import type { ProductPhoto, StorefrontProduct } from "../../catalog-api";

function Gallery({ photos, name }: { photos: ProductPhoto[]; name: string }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const photo = photos[activePhoto];

  return (
    <div>
      <div className="catalog-gallery-main">
        {photo ? <Image src={photo.url} alt={name} fill unoptimized /> : <p>No product photos yet.</p>}
      </div>
      {photos.length > 1 && (
        <div className="catalog-thumbnails" aria-label="Product photos" role="group">
          {photos.map(({ id, url }, index) => (
            <button key={id} type="button" aria-label={`View photo ${index + 1}`}
              aria-pressed={index === activePhoto} onClick={() => setActivePhoto(index)}>
              <Image src={url} alt="" fill unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductGallery({ product, prices }: { product: StorefrontProduct; prices: string[] }) {
  const [selected, setSelected] = useState(() => Math.max(0, product.variants.findIndex(variant => variant.in_stock)));
  const [quantity, setQuantity] = useState("1");
  const [feedback, setFeedback] = useState<"added" | "limit" | null>(null);
  const variant = product.variants[selected];
  const photos = [...variant.images, ...product.images];

  return (
    <div className="catalog-detail">
      <Gallery key={variant.id} photos={photos} name={product.name} />
      <div className="catalog-detail-info">
        <h1 className="category-title">{product.name}</h1>
        {product.description && <p className="catalog-description">{product.description}</p>}
        {product.has_variants && (
          <label>
            Variant
            <VariationSelect value={selected} onChange={event => {
              setSelected(Number(event.target.value));
              setQuantity("1");
              setFeedback(null);
            }}>
              {product.variants.map(({ id, label, in_stock }, index) => (
                <option key={id} value={index}>{label}{in_stock ? "" : " (out of stock)"}</option>
              ))}
            </VariationSelect>
          </label>
        )}
        <p aria-live="polite"><ProductPrice price={variant.price_cents} original={variant.compare_at_price_cents} formattedPrice={prices[selected]} />{variant.in_stock && " · In stock"}</p>
        {variant.in_stock ? <>
          <form className="purchase-controls" onSubmit={event => {
            event.preventDefault();
            const added = addToCart({
              variant_id: variant.id, quantity: Number(quantity), slug: product.slug,
              name: product.name, label: product.has_variants ? variant.label : "",
            });
            setFeedback(added ? "added" : "limit");
          }}>
            <label>Quantity
              <input className="commerce-input" type="number" required min={1} max={MAX_QUANTITY}
                value={quantity} onChange={event => {
                  setQuantity(event.target.value);
                  setFeedback(null);
                }} />
            </label>
            <AddToCartButton type="submit" />
          </form>
          <p role="status">
            {feedback === "added" && <>Added to cart. <Link className="commerce-secondary-link" href="/cart">View cart</Link></>}
            {feedback === "limit" && "The cart has reached its item or quantity limit."}
          </p>
        </> : <div className="purchase-controls">
          <button className="btn" type="button" disabled>Sold out</button>
          {product.variants.some(option => option.in_stock)
            ? <p className="commerce-muted">Choose an in-stock variant to continue.</p>
            : <Link className="btn fill" href="/products">Browse products</Link>}
        </div>}
      </div>
    </div>
  );
}

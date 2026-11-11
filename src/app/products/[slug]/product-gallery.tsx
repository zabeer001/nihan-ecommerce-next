"use client";

import Image from "next/image";
import { useState } from "react";
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
  const [selected, setSelected] = useState(0);
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
            <select value={selected} onChange={event => setSelected(Number(event.target.value))}>
              {product.variants.map(({ id, label }, index) => <option key={id} value={index}>{label}</option>)}
            </select>
          </label>
        )}
        <p aria-live="polite">{prices[selected]} · {variant.in_stock ? "In stock" : "Out of stock"}</p>
      </div>
    </div>
  );
}

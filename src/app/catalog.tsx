import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { formatPrice, getProducts } from "./catalog-api";

const scents = [
  ["Woody", "Oud Noir", "Smoked oud, amber and a trace of leather."],
  ["Fresh", "Padma", "Water lily, cool musk and green tea."],
  ["Green", "Mango Leaf", "Crushed leaves and sun-warmed fruit."],
  ["Warm", "Monsoon", "Wet earth, cardamom and soft vanilla."],
];

export function DiffuserArtwork({ tint = 0 }: { tint?: number }) {
  return (
    <svg
      viewBox="0 0 120 220"
      aria-hidden="true"
      style={tint ? { filter: `hue-rotate(${tint}deg)` } : undefined}
    >
      <use href="#diffuser" />
    </svg>
  );
}

export function ArtworkDefinitions() {
  return (
    <svg width="0" height="0" className="artwork-definitions" aria-hidden="true">
      <defs>
        <linearGradient id="metal" x1="0" x2="1">
          <stop offset="0" stopColor="#0c1210" />
          <stop offset=".35" stopColor="#3a4640" />
          <stop offset=".6" stopColor="#151d19" />
          <stop offset="1" stopColor="#0a0f0d" />
        </linearGradient>
        <radialGradient id="star">
          <stop offset="0" stopColor="#f4e4c1" />
          <stop offset="1" stopColor="#d4b483" stopOpacity="0" />
        </radialGradient>
        <symbol id="diffuser" viewBox="0 0 120 220">
          <ellipse cx="60" cy="206" rx="34" ry="6" fill="#000" opacity=".4" />
          <rect x="30" y="50" width="60" height="150" rx="14" fill="url(#metal)" stroke="#d4b483" strokeOpacity=".35" />
          <rect x="36" y="38" width="48" height="16" rx="4" fill="#1c2622" stroke="#d4b483" strokeOpacity=".45" />
          <circle cx="60" cy="150" r="22" fill="url(#star)" opacity=".55" />
          <circle cx="60" cy="150" r="3" fill="#f4e4c1" />
          <circle cx="48" cy="130" r="1.2" fill="#f4e4c1" />
          <circle cx="72" cy="168" r="1.2" fill="#f4e4c1" />
          <circle cx="70" cy="122" r="1" fill="#f4e4c1" />
          <circle cx="46" cy="172" r="1" fill="#f4e4c1" />
          <path
            d="M60 32c-8-10 8-14 0-26M52 34c-6-8 5-10 0-18M68 34c-6-8 5-10 0-18"
            fill="none"
            stroke="#d4b483"
            strokeOpacity=".5"
            strokeLinecap="round"
          />
        </symbol>
      </defs>
    </svg>
  );
}

type GridProps = {
  category?: "fragrance" | "accessories";
  searchParams?: Promise<{ page?: string | string[] }>;
};

export function ProductGrid(props: GridProps) {
  return (
    <Suspense fallback={<p role="status">Loading products…</p>}>
      <CatalogProducts {...props} />
    </Suspense>
  );
}

async function CatalogProducts({ category, searchParams }: GridProps) {
  const params = await searchParams;
  const requestedPage = typeof params?.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const catalog = await getProducts(category, page).catch(() => null);

  if (!catalog) return <p role="status">Products are temporarily unavailable.</p>;

  return (
    <>
      {catalog.data.length ? (
        <div className="grid">
          {catalog.data.map(({ slug, name, price_cents, image }) => (
            <article className="card" key={slug}>
              <Link href={`/products/${encodeURIComponent(slug)}`}>
                <div className="product-art">
                  {image && <Image src={image.url} alt="" fill unoptimized className="catalog-cover" />}
                </div>
                <h3>{name}</h3>
                <p>{formatPrice(price_cents)}</p>
              </Link>
            </article>
          ))}
        </div>
      ) : <p>No products on this page.</p>}
      {searchParams && (page > 1 || catalog.has_more) && (
        <nav className="catalog-pagination" aria-label="Product pages">
          {page > 1 && <Link className="link" href={{ query: { page: page - 1 } }}>Previous</Link>}
          {catalog.has_more && <Link className="link" href={{ query: { page: page + 1 } }}>Next</Link>}
        </nav>
      )}
    </>
  );
}

export function ScentGrid() {
  return (
    <div className="scents">
      {scents.map(([family, name, description]) => (
        <div className="scent" key={name}>
          <small>{family}</small>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      ))}
    </div>
  );
}

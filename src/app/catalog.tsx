import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { formatPrice, getProducts } from "./catalog-api";

type GridProps = {
  category?: string | number;
  search?: string;
  searchParams?: Promise<{ page?: string | string[] }>;
};

export function ProductGrid(props: GridProps) {
  return (
    <Suspense fallback={<p role="status">Loading products…</p>}>
      <CatalogProducts {...props} />
    </Suspense>
  );
}

async function CatalogProducts({ category, search, searchParams }: GridProps) {
  const params = await searchParams;
  const requestedPage = typeof params?.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const catalog = await getProducts(category, page, search).catch(() => null);
  const query = {
    ...(typeof category === "number" && { category: String(category) }),
    ...(search && { q: search }),
  };

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
      ) : <p>{search && page === 1 ? "No products match your search." : "No products on this page."}</p>}
      {searchParams && (page > 1 || catalog.has_more) && (
        <nav className="catalog-pagination" aria-label="Product pages">
          {page > 1 && <Link className="link" href={{ query: { ...query, page: page - 1 } }}>Previous</Link>}
          {catalog.has_more && <Link className="link" href={{ query: { ...query, page: page + 1 } }}>Next</Link>}
        </nav>
      )}
    </>
  );
}

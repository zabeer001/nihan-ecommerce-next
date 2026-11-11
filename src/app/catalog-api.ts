import { connection } from "next/server";

export type ProductPhoto = { id: number; url: string };

export type StorefrontProduct = {
  slug: string;
  name: string;
  description: string | null;
  images: ProductPhoto[];
  has_variants: boolean;
  variants: {
    id: number;
    label: string;
    price_cents: number;
    in_stock: boolean;
    images: ProductPhoto[];
  }[];
};

type ProductSummary = Pick<StorefrontProduct, "slug" | "name"> & {
  price_cents: number;
  image: ProductPhoto | null;
};

export type CatalogPage = {
  data: ProductSummary[];
  has_more: boolean;
};

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(cents / 100);
}

async function requestCatalog(path: string) {
  await connection();
  const origin = process.env.NIHAN_CATALOG_API_URL || "http://localhost:97";
  const url = new URL(`/api/storefront/products${path}`, origin);
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (response.status !== 404 && !response.ok) throw new Error("Catalog request failed.");

  return { response, url };
}

function resolvePhoto(photo: ProductPhoto, base: URL): ProductPhoto {
  return { ...photo, url: new URL(photo.url, base).href };
}

export async function getProducts(category: string | undefined, page: number): Promise<CatalogPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (category) params.set("category", category);

  const { response, url } = await requestCatalog(`?${params}`);
  if (!response.ok) throw new Error("Catalog request failed.");

  const result: CatalogPage = await response.json();
  return {
    ...result,
    data: result.data.map(product => ({
      ...product,
      image: product.image && resolvePhoto(product.image, url),
    })),
  };
}

export async function getProduct(slug: string): Promise<StorefrontProduct | null> {
  const { response, url } = await requestCatalog(`/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;

  const { data }: { data: StorefrontProduct } = await response.json();
  return {
    ...data,
    images: data.images.map(photo => resolvePhoto(photo, url)),
    variants: data.variants.map(variant => ({
      ...variant,
      images: variant.images.map(photo => resolvePhoto(photo, url)),
    })),
  };
}

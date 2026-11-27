import { connection } from "next/server";
import { cache } from "react";

export type CategoryContentCard = { label: string; title: string; description: string; color: string };
export type CategoryUsageGuide = {
  heading: string | null;
  button_text: string | null;
  button_url: string | null;
  steps: { title: string; description: string }[];
};
export type CatalogCategory = { id: number; name: string; content_cards: CategoryContentCard[] | null; usage_guide: CategoryUsageGuide | null };

export type HomepageContent = {
  alt_text: string | null;
  id: number;
  placement: "hero" | "collection_interlude";
  position: number;
  media_type: "video" | "image";
  media_url: string;
  poster_url: string | null;
  heading: string | null;
  description: string | null;
  button_text: string | null;
  button_url: string | null;
};

export const getHomepageContent = cache(async (): Promise<HomepageContent[]> => {
  const { response, url } = await requestCatalog("homepage-content");
  if (!response.ok) return [];
  const { data }: { data: HomepageContent[] } = await response.json();
  return data.map(item => ({ ...item, media_url: new URL(item.media_url, url).href,
    poster_url: item.poster_url ? new URL(item.poster_url, url).href : null }));
});

export type HomepageReview = {
  id: number; author_name: string; rating: number; title: string | null; body: string;
  product_name: string; product_slug: string;
};

export type HomepageReviewPage = { data: HomepageReview[]; current_page: number; last_page: number };

export const getHomepageReviews = cache(async (): Promise<HomepageReviewPage> => {
  const { response } = await requestCatalog("reviews");
  if (!response.ok) throw new Error("Reviews request failed.");
  return response.json();
});

export function categoryHref(id: number) {
  return `/products?category=${id}`;
}

export type ProductPhoto = { id: number; url: string };

export type StorefrontProduct = {
  slug: string;
  name: string;
  description: string | null;
  images: ProductPhoto[];
  meta_title: string | null;
  meta_description: string | null;
  meta_pixel_id: string | null;
  has_variants: boolean;
  variants: {
    id: number;
    label: string;
    price_cents: number;
    compare_at_price_cents: number | null;
    in_stock: boolean;
    images: ProductPhoto[];
  }[];
};

type ProductSummary = Pick<StorefrontProduct, "slug" | "name"> & {
  variants: Omit<StorefrontProduct["variants"][number], "images">[];
  price_cents: number;
  compare_at_price_cents: number | null;
  image: ProductPhoto | null;
};

export type CatalogPage = {
  data: ProductSummary[];
  has_more: boolean;
};

export { formatPrice } from "./money";

async function requestCatalog(path: string) {
  await connection();
  const origin = process.env.NIHAN_CATALOG_API_URL || "http://localhost:97";
  const url = new URL(`/api/storefront/${path}`, origin);
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

export const getCategories = cache(async (): Promise<CatalogCategory[]> => {
  const { response } = await requestCatalog("categories");
  if (!response.ok) throw new Error("Catalog categories request failed.");

  const { data }: { data: CatalogCategory[] } = await response.json();
  return data;
});

export async function getProducts(category: string | number | undefined, page: number, search?: string): Promise<CatalogPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (typeof category === "number") params.set("category_id", String(category));
  if (typeof category === "string") params.set("category", category);
  if (search) params.set("q", search);

  const { response, url } = await requestCatalog(`products?${params}`);
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

export const getProduct = cache(async (slug: string): Promise<StorefrontProduct | null> => {
  const { response, url } = await requestCatalog(`products/${encodeURIComponent(slug)}`);
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
});

export type StorefrontSettings = {
  gtm_container_id: string | null;
  meta_pixel_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  google_site_verification: string | null;
};

export const getStorefrontSettings = cache(async (): Promise<StorefrontSettings> => {
  const { response } = await requestCatalog("settings");
  if (!response.ok) throw new Error("Storefront settings request failed.");
  const { data }: { data: StorefrontSettings } = await response.json();
  return data;
});

export type HeaderLogos = { before_hover_url: string | null; after_hover_url: string | null };

export const getHeaderLogos = cache(async (): Promise<HeaderLogos> => {
  const { response, url } = await requestCatalog("header-logos");
  if (!response.ok) throw new Error("Header logos request failed.");
  const { data }: { data: HeaderLogos } = await response.json();
  return {
    before_hover_url: data.before_hover_url ? new URL(data.before_hover_url, url).href : null,
    after_hover_url: data.after_hover_url ? new URL(data.after_hover_url, url).href : null,
  };
});

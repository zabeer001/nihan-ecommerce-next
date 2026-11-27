import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatPrice, getProduct, getStorefrontSettings } from "../../catalog-api";
import { ProductGallery } from "./product-gallery";
import { ProductReviews } from "./product-reviews";
import { StorefrontPage } from "../../storefront-page";
import { ProductPixel } from "./product-pixel";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => undefined);
  if (product === undefined) return { title: "Product | NIHAN" };
  if (!product) notFound();
  const settings = await getStorefrontSettings().catch(() => null);
  const title = `${product.name} | ${settings?.meta_title || "NIHAN"}`;
  const description = product.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || settings?.meta_description || undefined;
  const image = product.images[0] || product.variants.flatMap(variant => variant.images)[0];
  return {
    title, description,
    openGraph: { title, description, images: image ? [image.url] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image.url] : [] },
  };
}

async function ProductDetails({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => undefined);
  if (product === undefined) return <p role="status">Product details are temporarily unavailable.</p>;
  if (!product) notFound();

  const settings = await getStorefrontSettings().catch(() => null);
  return <><ProductPixel key={slug} pixelId={settings?.meta_pixel_id || null} slug={slug} name={product.name} /><ProductGallery product={product} prices={product.variants.map(variant => formatPrice(variant.price_cents))} /><ProductReviews key={slug} slug={slug} /></>;
}

export default function ProductPage(props: PageProps<"/products/[slug]">) {
  return (
    <StorefrontPage>
      <section className="wrap">
        <Link className="link" href="/products">All products</Link>
        <Suspense fallback={<p role="status">Loading product…</p>}>
          <ProductDetails {...props} />
        </Suspense>
      </section>
    </StorefrontPage>
  );
}

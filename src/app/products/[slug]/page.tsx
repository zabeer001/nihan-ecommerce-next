import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatPrice, getProduct } from "../../catalog-api";
import { ProductGallery } from "./product-gallery";

async function ProductDetails({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => undefined);
  if (product === undefined) return <p role="status">Product details are temporarily unavailable.</p>;
  if (!product) notFound();

  return <ProductGallery product={product} prices={product.variants.map(variant => formatPrice(variant.price_cents))} />;
}

export default function ProductPage(props: PageProps<"/products/[slug]">) {
  return (
    <main>
      <section className="wrap">
        <Link className="link" href="/products">All products</Link>
        <Suspense fallback={<p role="status">Loading product…</p>}>
          <ProductDetails {...props} />
        </Suspense>
      </section>
    </main>
  );
}

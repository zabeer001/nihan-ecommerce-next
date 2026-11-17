import Image from "next/image";
import Link from "next/link";
import type { CatalogPage } from "./catalog-api";
import { formatPrice } from "./money";

export function ProductCard({
  product,
  heading: Heading = "h3",
}: {
  product: CatalogPage["data"][number];
  heading?: "h3" | "h4";
}) {
  const { slug, name, image, price_cents } = product;

  return (
    <article className="tile">
      <Link href={`/products/${encodeURIComponent(slug)}`}>
        <div className="tile-art">
          {image && <Image src={image.url} alt="" fill unoptimized className="cover" />}
        </div>
        <Heading>{name}</Heading>
        <p>{formatPrice(price_cents)}</p>
      </Link>
    </article>
  );
}

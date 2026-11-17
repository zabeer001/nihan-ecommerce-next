import type { Metadata } from "next";
import { ProductGrid } from "../catalog";
import { StorefrontPage } from "../storefront-page";

export const metadata: Metadata = {
  title: "Accessories – NIHAN",
  description: "Explore the NIHAN AI Car Aroma Diffuser.",
};

export default function AccessoriesPage({ searchParams }: PageProps<"/accessories">) {
  return (
    <StorefrontPage>
      <section aria-labelledby="accessories-title">
        <div className="wrap">
          <div className="head">
            <h1 className="category-title" id="accessories-title">Accessories</h1>
          </div>
          <ProductGrid category="accessories" searchParams={searchParams} />
        </div>
      </section>
    </StorefrontPage>
  );
}

import { Suspense } from "react";
import { getCategories } from "../catalog-api";
import type { Metadata } from "next";
import { ProductGrid } from "../catalog";
import { ScentGrid } from "../scent-grid";
import { StorefrontPage } from "../storefront-page";

export const metadata: Metadata = {
  title: "Fragrance – NIHAN",
  description: "Explore all four NIHAN car fragrances and browse the refill collection.",
};

async function FragranceContent() {
  const categories = await getCategories().catch(() => []);
  const category = categories.find(item => item.name.toLowerCase() === "fragrance");
  return <ScentGrid cards={category?.content_cards ?? null} />;
}

export default function FragrancePage({ searchParams }: PageProps<"/fragrance">) {
  return (
    <StorefrontPage>
      <section aria-labelledby="fragrance-title">
        <div className="wrap">
          <div className="head">
            <h1 className="category-title" id="fragrance-title">Fragrance</h1>
          </div>
          <Suspense><FragranceContent /></Suspense>
          <div className="category-refills" id="refills">
            <h2>50 ml refills</h2>
            <ProductGrid category="fragrance" searchParams={searchParams} />
          </div>
        </div>
      </section>
    </StorefrontPage>
  );
}

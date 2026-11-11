import type { Metadata } from "next";
import { ProductGrid, ScentGrid } from "../catalog";

export const metadata: Metadata = {
  title: "Fragrance – NIHAN",
  description: "Explore all four NIHAN car fragrances and browse the refill collection.",
};

export default function FragrancePage({ searchParams }: PageProps<"/fragrance">) {
  return (
    <main>
      <section aria-labelledby="fragrance-title">
        <div className="wrap">
          <div className="head">
            <h1 className="category-title" id="fragrance-title">Fragrance</h1>
          </div>
          <ScentGrid />
          <div className="category-refills" id="refills">
            <h2>50 ml refills</h2>
            <ProductGrid category="fragrance" searchParams={searchParams} />
          </div>
        </div>
      </section>
    </main>
  );
}

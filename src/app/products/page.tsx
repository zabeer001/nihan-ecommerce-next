import type { Metadata } from "next";
import { ProductGrid } from "../catalog";

export const metadata: Metadata = { title: "Shop – NIHAN" };

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <main>
      <section className="wrap">
        <div className="head"><h1 className="category-title">Shop</h1></div>
        <ProductGrid searchParams={searchParams} />
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "../catalog";
import { getCategories } from "../catalog-api";

export const metadata: Metadata = { title: "Shop – NIHAN" };

async function Shop({ searchParams }: PageProps<"/products">) {
  const [params, categories] = await Promise.all([searchParams, getCategories().catch(() => null)]);
  const category = categories?.find(({ id }) => String(id) === params.category);
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const searchQuery = search ? { q: search } : {};

  return (
    <>
      <div className="head"><h1 className="category-title">{search ? "Search results" : category?.name ?? "Shop"}</h1></div>
      {search && <p>Products matching “{search}”</p>}
      {!!categories?.length && (
        <nav className="catalog-filters" aria-label="Product categories">
          <Link href={{ pathname: "/products", query: searchQuery }} aria-current={params.category === undefined ? "page" : undefined}>All products</Link>
          {categories.map(({ id, name }) => (
            <Link key={id} href={{ pathname: "/products", query: { ...searchQuery, category: id } }} aria-current={category?.id === id ? "page" : undefined}>{name}</Link>
          ))}
        </nav>
      )}
      {params.category !== undefined && !category ? (
        <p role="status">{categories ? "This category is unavailable." : "Categories are temporarily unavailable."}</p>
      ) : (
        <ProductGrid category={category?.id} search={search} searchParams={searchParams} />
      )}
    </>
  );
}

export default function ProductsPage(props: PageProps<"/products">) {
  return (
    <main>
      <section className="wrap">
        <Suspense fallback={<p role="status">Loading shop…</p>}>
          <Shop {...props} />
        </Suspense>
      </section>
    </main>
  );
}

import Homepage, { type HomepageCollection } from "./homepage";
import { getCategories, getProducts, getHomepageContent, getHomepageReviews } from "./catalog-api";

async function getHomepageCollections(): Promise<HomepageCollection[] | null> {
  const categories = await getCategories().catch(() => null);

  return categories?.map(category => ({
    ...category,
    products: getProducts(category.id, 1).catch(() => null),
  })) ?? null;
}

export default function Page() {
  return <Homepage collections={getHomepageCollections()} homepageContent={getHomepageContent().catch(() => [])} reviews={getHomepageReviews().catch(() => ({ data: [], current_page: 1, last_page: 1 }))} />;
}

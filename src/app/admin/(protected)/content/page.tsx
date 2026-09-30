import { db } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { ContentAdmin } from "@/components/admin/content";
export default async function Content() {
  const [settings, categories, collections, pages, reviews, products] =
    await Promise.all([
      getSettings(),
      db.category.findMany({ orderBy: { sort: "asc" } }),
      db.collection.findMany(),
      db.page.findMany(),
      db.review.findMany(),
      db.product.findMany({ select: { id: true, name: true } }),
    ]);
  return (
    <ContentAdmin
      settings={settings}
      initialCategories={JSON.parse(JSON.stringify(categories))}
      initialCollections={JSON.parse(JSON.stringify(collections))}
      initialPages={pages}
      initialReviews={JSON.parse(JSON.stringify(reviews))}
      products={products}
    />
  );
}

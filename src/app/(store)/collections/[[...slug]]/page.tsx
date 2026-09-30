import { getProducts } from "@/lib/catalog";
import { db } from "@/lib/db";
import { CatalogGrid } from "@/components/catalog-grid";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StoreIntro } from "@/components/store-intro";
export default async function Collections({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ q?: string; size?: string }>;
}) {
  const { slug } = await params;
  const q = await searchParams;
  let title = "The fragrance collection",
    description =
      "Find a scent for your everyday, your evenings, and everything in between.";
  let products = await getProducts();
  if (slug?.length) {
    const key = slug[0];
    if (slug.length > 1) notFound();
    const [cat, col] = await Promise.all([
      db.category.findUnique({ where: { slug: key } }),
      db.collection.findUnique({ where: { slug: key } }),
    ]);
    if (cat?.active) {
      title = cat.name;
      products = products.filter((p) =>
        ["perfumes", "attars", "gift-sets"].includes(key)
          ? p.type ===
            { perfumes: "Perfume", attars: "Attar", "gift-sets": "Gift Set" }[
              key
            ]
          : p.category === cat.name,
      );
    } else if (col?.active) {
      title = col.name;
      description = col.description || description;
      const filter = col.filter as {
        badge?: string;
        featured?: boolean;
        category?: string;
      };
      products = products.filter(
        (p) =>
          (!filter.badge || p.badges.includes(filter.badge)) &&
          (!filter.featured || p.featured) &&
          (!filter.category || p.category === filter.category),
      );
    } else notFound();
  }
  return (
    <div className="container catalog-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Collection</span>
      </nav>
      <StoreIntro title={title} description={description}>
        <div className="collection-count">
          <strong>{products.length}</strong>
          <span>fragrances to discover</span>
        </div>
      </StoreIntro>
      <CatalogGrid
        key={`${slug?.join("/") || "all"}:${q.q || ""}:${q.size || ""}`}
        products={products}
        initialQuery={q.q || ""}
        initialSize={q.size || ""}
      />
    </div>
  );
}

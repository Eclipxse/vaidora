import { getProducts } from "@/lib/catalog";
import { CatalogGrid } from "@/components/catalog-grid";
import { StoreIntro } from "@/components/store-intro";
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <div className="container catalog-page">
      <StoreIntro
        tone="paper"
        title="Find your fragrance."
        description="Search by fragrance name, category, type or bottle size."
      />
      <CatalogGrid
        key={q || ""}
        products={await getProducts()}
        initialQuery={q || ""}
      />
    </div>
  );
}

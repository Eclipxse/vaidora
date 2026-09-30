import { getProducts } from "@/lib/catalog";
import { CatalogGrid } from "@/components/catalog-grid";
import Link from "next/link";
import { StoreIntro } from "@/components/store-intro";
import { ArrowUpRight } from "@/components/icons";
export default async function Wishlist() {
  return (
    <div className="container catalog-page">
      <StoreIntro
        tone="citron"
        title="The ones you love."
        description="Your fragrance shortlist. Saved on this device, ready whenever you are."
      >
        <Link className="text-link" href="/collections">
          Keep exploring <ArrowUpRight size={20} />
        </Link>
      </StoreIntro>
      <CatalogGrid products={await getProducts()} savedOnly />
    </div>
  );
}

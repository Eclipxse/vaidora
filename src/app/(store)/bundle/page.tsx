import { getProducts, getSettings } from "@/lib/catalog";
import { BundleBuilder } from "@/components/bundle-builder";
import { StoreIntro } from "@/components/store-intro";
export default async function Bundle() {
  const [products, s] = await Promise.all([getProducts(), getSettings()]);
  return (
    <div className="container catalog-page">
      <StoreIntro
        title="Good together. Better your way."
        description={`Choose ${s.bundleCount} fragrances for a collection that’s entirely your own.`}
        tone="citron"
      >
        <div className="collection-count">
          <strong>{s.bundleCount}</strong>
          <span>fragrances. Your collection.</span>
        </div>
      </StoreIntro>
      <BundleBuilder products={products} settings={s} />
    </div>
  );
}

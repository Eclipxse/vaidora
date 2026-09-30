import { getSettings, getProducts } from "@/lib/catalog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FavoritesProvider } from "@/components/favorites";
import "../storefront.css";
import "@fontsource/urbanist/400.css";
import "@fontsource/urbanist/500.css";
import "@fontsource/urbanist/600.css";
import "@fontsource/urbanist/700.css";
import "@fontsource/arsenal/400.css";
import "@fontsource/arsenal/700.css";
export const dynamic = "force-dynamic";
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, products] = await Promise.all([
    getSettings(),
    getProducts(),
  ]);
  return (
    <FavoritesProvider>
      <div className="store-shell">
        <Header settings={settings} products={products} />
        <main id="main">{children}</main>
        {settings.previewMode && (
          <div className="preview-note">
            Preview catalog. Confirm availability and delivery with Vaidora.
          </div>
        )}
        <Footer settings={settings} />
      </div>
    </FavoritesProvider>
  );
}

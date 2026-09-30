import { getProduct, getProducts, getSettings } from "@/lib/catalog";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await getProduct((await params).slug);
  return {
    title: p?.name || "Fragrance not found",
    description: p?.description,
  };
}
export default async function Product({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ size?: string }>;
}) {
  const [p, products, s, q] = await Promise.all([
    getProduct((await params).slug),
    getProducts(),
    getSettings(),
    searchParams,
  ]);
  if (!p) notFound();
  return (
    <ProductDetail
      key={p.id}
      product={p}
      products={products}
      phone={s.whatsapp}
      initialSize={q.size ? Number(q.size) : undefined}
    />
  );
}

import { getProducts } from "@/lib/catalog";
import { ProductsAdmin } from "@/components/admin/products";
export default async function Products() {
  return <ProductsAdmin products={await getProducts(true)} />;
}

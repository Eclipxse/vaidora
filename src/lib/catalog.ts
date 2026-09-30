import { db } from "./db";
import {
  defaultSettings,
  type ProductRecord,
  type SiteSettings,
} from "./types";
export async function getSettings(): Promise<SiteSettings> {
  const row = await db.setting.findUnique({ where: { key: "site" } });
  return { ...defaultSettings, ...((row?.value as object) ?? {}) };
}
export async function getProducts(admin = false): Promise<ProductRecord[]> {
  const rows = await db.product.findMany({
    where: admin ? {} : { active: true, archived: false },
    include: {
      variants: { orderBy: { size: "asc" } },
      images: { orderBy: { sort: "asc" } },
      reviews: { where: admin ? {} : { approved: true } },
    },
    orderBy: [
      { featured: "desc" },
      { catalogNumber: "asc" },
      { createdAt: "desc" },
    ],
  });
  return JSON.parse(JSON.stringify(rows));
}
export async function getCategories() {
  return db.category.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
  });
}
export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

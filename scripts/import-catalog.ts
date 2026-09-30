import "dotenv/config";
import { readFile, access } from "node:fs/promises";
import { db } from "../src/lib/db";
import { exportImage, publicFile } from "../src/lib/compositor";
import { getSettings } from "../src/lib/catalog";
import { slugify, type TemplateRecord } from "../src/lib/types";
type Source = {
  records: {
    number: number;
    name: string;
    category: string;
    prices: Record<string, number>;
  }[];
};
async function main() {
  const source: Source = JSON.parse(
    await readFile("docs/catalog-source.json", "utf8"),
  );
  const slugs = source.records.map((r) => slugify(r.name));
  // Archive the five illustrative starter names when they are not in the supplied catalog.
  await db.product.updateMany({
    where: {
      slug: {
        in: ["good-girl", "black-opium", "sauvage", "bleu", "oud-wood"],
        notIn: slugs,
      },
    },
    data: { active: false, archived: true, featured: false },
  });
  const templates = await db.imageTemplate.findMany({
    where: { size: { in: [12, 100] } },
  });
  const featured = [
    "GOOD GIRL",
    "DIOR SAUVAGE",
    "YSL BLACK OPIUM",
    "TOM FORD OUD WOOD",
  ];
  for (const row of source.records) {
    const slug = slugify(row.name);
    const images: Record<number, string> = {};
    for (const template of templates) {
      const expected = `/products/${slug}/${template.size}ml.webp`;
      let exists = true;
      try {
        await access(publicFile(expected));
      } catch {
        exists = false;
      }
      images[template.size] = exists
        ? expected
        : await exportImage(
            template as unknown as TemplateRecord,
            row.name,
            slug,
          );
    }
    const description = `${row.name} from the Vaidora fragrance catalog. Choose from 6 ML, 12 ML, 20 ML, 50 ML or 100 ML, or enquire about the car diffuser. Message us for the scent profile, current stock and delivery details.`;
    const data = {
      name: row.name,
      catalogNumber: row.number,
      category: row.category,
      type: "Perfume",
      summary: "Your fragrance. Your size.",
      description,
      notes: { top: "", heart: "", base: "" },
      badges: [],
      active: true,
      archived: false,
      featured: featured.includes(row.name),
    };
    await db.$transaction(async (tx) => {
      const product = await tx.product.upsert({
        where: { slug },
        create: { slug, ...data },
        update: data,
      });
      for (const [sizeString, price] of Object.entries(row.prices)) {
        const size = Number(sizeString);
        await tx.productVariant.upsert({
          where: { productId_size: { productId: product.id, size } },
          create: {
            productId: product.id,
            size,
            price,
            mrp: price,
            stock: 0,
            enabled: true,
            image: images[size] || images[100],
            imageSize: images[size] ? size : 100,
          },
          update: {
            price,
            mrp: price,
            enabled: true,
            image: images[size] || images[100],
            imageSize: images[size] ? size : 100,
          },
        });
      }
    });
    console.log(`Imported ${row.number}/87: ${row.name}`);
  }
  const s = await getSettings();
  await db.setting.update({
    where: { key: "site" },
    data: {
      value: {
        ...s,
        previewMode: false,
        announcement:
          "87 fragrances. Five sizes. Find your signature with Vaidora.",
        navigation: [
          { label: "All fragrances", href: "/collections" },
          { label: "For her", href: "/collections/women" },
          { label: "For him", href: "/collections/men" },
          { label: "Unisex", href: "/collections/unisex" },
          { label: "Pocket perfumes", href: "/collections?size=12" },
          { label: "Car diffusers", href: "/collections?size=0" },
          { label: "Build your bundle", href: "/bundle" },
        ],
        sections: [
          { title: "Find your signature", filter: "featured", enabled: true },
          { title: "The fragrance library", filter: "all", enabled: true },
          { title: "The feminine edit", filter: "Women", enabled: true },
        ],
      },
    },
  });
  await db.category.updateMany({
    where: { slug: { in: ["attars", "gift-sets", "fragrances"] } },
    data: { active: false },
  });
  await db.category.updateMany({
    where: { slug: { in: ["women", "men", "unisex", "perfumes"] } },
    data: { active: true },
  });
  console.log(
    `Complete: ${source.records.length} fragrances, ${source.records.length * 6} options, 174 actual-size images. Other sizes use disclosed representative photography.`,
  );
}
main().finally(() => db.$disconnect());

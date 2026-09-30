import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { db } from "../src/lib/db";

async function main() {
  const [products, categories, collections, templates, settings, pages] =
    await Promise.all([
      db.product.findMany({
        include: { variants: true, images: true, reviews: true },
      }),
      db.category.findMany(),
      db.collection.findMany(),
      db.imageTemplate.findMany(),
      db.setting.findMany(),
      db.page.findMany(),
    ]);
  const published = products.filter(
    (product) => product.active && !product.archived,
  );
  if (
    published.length !== 87 ||
    published.reduce(
      (total, product) =>
        total + product.variants.filter((variant) => variant.enabled).length,
      0,
    ) !== 522
  ) {
    throw new Error(
      "The deployment catalog must contain the verified 87 published fragrances and 522 enabled variants.",
    );
  }
  await mkdir("deploy", { recursive: true });
  await writeFile(
    "deploy/catalog.snapshot.json",
    JSON.stringify(
      {
        schemaVersion: 1,
        products,
        categories,
        collections,
        templates,
        settings,
        pages,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      publishedProducts: published.length,
      enabledVariants: 522,
      includesSecretsOrLoginState: false,
    }),
  );
}
main().finally(() => db.$disconnect());

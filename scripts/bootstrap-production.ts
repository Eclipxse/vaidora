import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { z } from "zod";
import { db } from "../src/lib/db";
import { Prisma } from "@prisma/client";

async function main() {
  if (
    !process.env.DATABASE_URL ||
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    (process.env.SESSION_SECRET?.length ?? 0) < 32
  ) {
    throw new Error(
      "Configure the production database, owner access and session secret before initializing.",
    );
  }
  const snapshot = z
    .object({
      schemaVersion: z.literal(1),
      products: z.array(z.any()),
      categories: z.array(z.any()),
      collections: z.array(z.any()),
      templates: z.array(z.any()),
      settings: z.array(z.any()),
      pages: z.array(z.any()),
    })
    .parse(JSON.parse(await readFile("deploy/catalog.snapshot.json", "utf8")));
  const published = snapshot.products.filter(
    (product) => product.active && !product.archived,
  );
  if (
    published.length !== 87 ||
    published.reduce(
      (total, product) =>
        total +
        product.variants.filter(
          (variant: { enabled: boolean }) => variant.enabled,
        ).length,
      0,
    ) !== 522
  ) {
    throw new Error("Deployment snapshot does not match the verified catalog.");
  }
  execFileSync(
    process.execPath,
    [
      resolve("node_modules/prisma/build/index.js"),
      "db",
      "push",
      "--skip-generate",
    ],
    { stdio: "inherit" },
  );
  const count = await db.product.count();
  if (count !== 0 || (await db.setting.count()) !== 0) {
    console.log(
      "Existing database detected; catalog and owner changes are preserved. Snapshot import skipped.",
    );
    return;
  }
  await db.$transaction(
    async (transaction) => {
      for (const product of snapshot.products) {
        const { variants, images, reviews, ...record } = product;
        await transaction.product.create({
          data: {
            ...record,
            variants: {
              create: variants.map(
                ({ productId, ...variant }: { productId: string }) => variant,
              ),
            },
            images: {
              create: images.map(
                ({ productId, ...image }: { productId: string }) => image,
              ),
            },
            reviews: {
              create: reviews.map(
                ({ productId, ...review }: { productId: string }) => review,
              ),
            },
          },
        });
      }
      if (snapshot.categories.length)
        await transaction.category.createMany({ data: snapshot.categories });
      if (snapshot.collections.length)
        await transaction.collection.createMany({ data: snapshot.collections });
      if (snapshot.templates.length)
        await transaction.imageTemplate.createMany({
          data: snapshot.templates,
        });
      if (snapshot.settings.length)
        await transaction.setting.createMany({ data: snapshot.settings });
      if (snapshot.pages.length)
        await transaction.page.createMany({ data: snapshot.pages });
    },
    { timeout: 120000 },
  );
  console.log(
    "Imported the verified 87-fragrance catalog into the new database. No login attempts or generation jobs were copied.",
  );
}
main()
  .catch((error) => {
    console.error(
      error instanceof Prisma.PrismaClientKnownRequestError
        ? "Database initialization failed; check server logs without publishing credentials."
        : error.message,
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

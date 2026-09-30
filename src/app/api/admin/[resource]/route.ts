import { db } from "@/lib/db";
import { requireAdmin, sameOrigin } from "@/lib/auth";
import { productSchema, templateSchema, errorResponse } from "@/lib/validation";
import { getProducts, getSettings } from "@/lib/catalog";
import { slugify, defaultSettings } from "@/lib/types";
import { z } from "zod";
import { publicFile } from "@/lib/compositor";
import sharp from "sharp";
type Context = { params: Promise<{ resource: string }> };
const safeLink = z
  .string()
  .max(300)
  .refine(
    (x) => /^\/(?!\/)/.test(x) && !x.includes("\\"),
    "Use a local path beginning with /",
  );
const imagePath = z
  .string()
  .max(300)
  .refine(
    (x) =>
      x === "" ||
      (/^\/(masters|uploads|products)\/[a-zA-Z0-9_./-]+(?:\?v=[a-f0-9]{12})?$/.test(
        x,
      ) &&
        !x.includes("..")),
    "Use an uploaded image",
  );
export async function GET(r: Request, c: Context) {
  try {
    await requireAdmin();
    const { resource } = await c.params;
    if (resource === "products") return Response.json(await getProducts(true));
    if (resource === "templates")
      return Response.json(
        await db.imageTemplate.findMany({ orderBy: { size: "asc" } }),
      );
    if (resource === "settings") return Response.json(await getSettings());
    if (resource === "categories")
      return Response.json(
        await db.category.findMany({ orderBy: { sort: "asc" } }),
      );
    if (resource === "collections")
      return Response.json(await db.collection.findMany());
    if (resource === "pages") return Response.json(await db.page.findMany());
    if (resource === "reviews")
      return Response.json(
        await db.review.findMany({
          include: { product: { select: { name: true } } },
        }),
      );
    throw new Error("Unknown resource");
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(r: Request, c: Context) {
  try {
    await requireAdmin();
    sameOrigin(r);
    const { resource } = await c.params;
    const body = await r.json();
    if (resource === "products") {
      if (body.action === "archive") {
        await db.product.update({
          where: { id: z.string().parse(body.id) },
          data: { archived: !!body.archived, active: !body.archived },
        });
        return Response.json({ ok: true });
      }
      if (body.action === "duplicate") {
        const p = await db.product.findUniqueOrThrow({
          where: { id: z.string().parse(body.id) },
          include: { variants: true },
        });
        const slug = `${p.slug}-copy-${Date.now().toString(36)}`;
        const { id, createdAt, updatedAt, variants, ...rest } = p;
        const copy = await db.product.create({
          data: {
            ...rest,
            name: `${p.name} (copy)`,
            slug,
            active: false,
            notes: p.notes!,
            badges: p.badges!,
            variants: { create: variants.map(({ id, productId, ...v }) => v) },
          },
        });
        return Response.json(copy);
      }
      if (body.action === "prices") {
        const v = z
          .object({
            size: z.number().refine((n) => [0, 6, 12, 20, 50, 100].includes(n)),
            mode: z.enum(["set", "increase"]),
            amount: z.number().int().min(0).max(100000),
            mrp: z.number().int().min(0).max(100000).optional(),
          })
          .parse(body);
        const result = await db.productVariant.updateMany({
          where: { size: v.size },
          data: {
            price: v.mode === "set" ? v.amount : { increment: v.amount },
            ...(v.mrp !== undefined ? { mrp: v.mrp } : {}),
          },
        });
        return Response.json({ updated: result.count });
      }
      if (body.action === "gallery") {
        const v = z
          .object({
            id: z.string(),
            url: imagePath,
            alt: z.string().min(1).max(250),
          })
          .parse(body);
        await db.productImage.create({
          data: { productId: v.id, url: v.url, alt: v.alt },
        });
        return Response.json({ ok: true });
      }
      const value = productSchema.parse(body.product);
      const { variants, ...data } = value;
      for (const v of variants) if (v.image) publicFile(v.image);
      const slug = slugify(data.name);
      if (!slug)
        throw new Error("Product name must contain letters or numbers.");
      const id = typeof body.id === "string" ? body.id : undefined;
      const product = await db.$transaction(async (tx) => {
        const p = id
          ? await tx.product.update({ where: { id }, data })
          : await tx.product.create({ data: { ...data, slug } });
        for (const v of variants)
          await tx.productVariant.upsert({
            where: { productId_size: { productId: p.id, size: v.size } },
            update: v,
            create: { ...v, productId: p.id },
          });
        await tx.productVariant.updateMany({
          where: {
            productId: p.id,
            size: { notIn: variants.map((v) => v.size) },
          },
          data: { enabled: false },
        });
        return p;
      });
      return Response.json(product);
    }
    if (resource === "templates") {
      const v = z
        .object({
          id: z.string(),
          name: z.string().min(1).max(100),
          base: imagePath,
          ready: z.boolean(),
          config: templateSchema,
        })
        .parse(body);
      let dimensions = {};
      if (v.base) {
        const m = await sharp(publicFile(v.base)).metadata();
        dimensions = { width: m.width, height: m.height };
      } else if (v.ready) throw new Error("Upload a master image first.");
      const result = await db.imageTemplate.update({
        where: { id: v.id },
        data: { ...v, ...dimensions, revision: { increment: 1 } },
      });
      return Response.json(result);
    }
    if (resource === "settings") {
      const schema = z.object({
        brand: z.string().min(1).max(50),
        whatsapp: z.string().regex(/^[1-9]\d{9,14}$/),
        announcement: z.string().max(180),
        previewMode: z.boolean(),
        heroTitle: z.string().max(100),
        heroCopy: z.string().max(250),
        heroImage: imagePath,
        heroLink: safeLink,
        heroButton: z.string().max(50),
        bundleCount: z.number().int().min(2).max(6),
        bundlePrice: z.number().int().min(0).max(1000000),
        bundleSize: z.number().refine((x) => [6, 12, 20, 50, 100].includes(x)),
        navigation: z
          .array(z.object({ label: z.string().min(1).max(50), href: safeLink }))
          .max(12),
        sections: z
          .array(
            z.object({
              title: z.string().max(100),
              filter: z.string().max(100),
              enabled: z.boolean(),
            }),
          )
          .max(12),
        banners: z
          .array(
            z.object({
              title: z.string().max(100),
              copy: z.string().max(250),
              image: imagePath,
              href: safeLink,
            }),
          )
          .max(4),
      });
      const value = schema.parse({ ...defaultSettings, ...body });
      await db.setting.upsert({
        where: { key: "site" },
        update: { value },
        create: { key: "site", value },
      });
      return Response.json({ ok: true });
    }
    if (resource === "categories") {
      const v = z
        .object({
          id: z.string().optional(),
          name: z.string().min(1).max(80),
          slug: z.string().regex(/^[a-z0-9-]+$/),
          image: imagePath,
          active: z.boolean(),
          sort: z.number().int().min(0).max(1000),
        })
        .parse(body);
      const { id, ...data } = v;
      return Response.json(
        id
          ? await db.category.update({ where: { id }, data })
          : await db.category.create({ data }),
      );
    }
    if (resource === "collections") {
      const v = z
        .object({
          id: z.string().optional(),
          name: z.string().min(1).max(80),
          slug: z.string().regex(/^[a-z0-9-]+$/),
          image: imagePath,
          active: z.boolean(),
          description: z.string().max(1000),
          filter: z.object({
            category: z.string().max(80).optional(),
            badge: z.string().max(40).optional(),
            featured: z.boolean().optional(),
          }),
        })
        .parse(body);
      const { id, ...data } = v;
      return Response.json(
        id
          ? await db.collection.update({ where: { id }, data })
          : await db.collection.create({ data }),
      );
    }
    if (resource === "pages") {
      const v = z
        .object({
          slug: z.enum([
            "about",
            "contact",
            "faq",
            "shipping",
            "returns",
            "privacy",
            "terms",
          ]),
          title: z.string().min(1).max(150),
          content: z.string().max(25000),
        })
        .parse(body);
      return Response.json(
        await db.page.upsert({ where: { slug: v.slug }, update: v, create: v }),
      );
    }
    if (resource === "reviews") {
      const v = z
        .object({
          id: z.string().optional(),
          productId: z.string(),
          author: z.string().min(1).max(100),
          rating: z.number().int().min(1).max(5),
          text: z.string().min(1).max(3000),
          approved: z.boolean(),
        })
        .parse(body);
      const { id, ...data } = v;
      return Response.json(
        id
          ? await db.review.update({ where: { id }, data })
          : await db.review.create({ data }),
      );
    }
    throw new Error("Unknown resource");
  } catch (e) {
    return errorResponse(e);
  }
}

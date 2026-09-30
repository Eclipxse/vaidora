import { z } from "zod";
const text = z.string().trim().max(5000);
const layer = z
  .object({
    enabled: z.boolean(),
    x: z.number().min(0).max(10000),
    y: z.number().min(0).max(10000),
    maxWidth: z.number().min(10).max(6000),
    fontSize: z.number().int().min(6).max(400),
    minFontSize: z.number().int().min(6).max(400),
    maxLines: z.number().int().min(1).max(4),
    font: z.enum(["Arial", "Georgia", "Trebuchet MS"]),
    weight: z.number().int().min(100).max(900),
    spacing: z.number().min(-5).max(30),
    align: z.enum(["center", "left", "right"]),
    rotation: z.number().min(-45).max(45),
    skew: z.number().min(-30).max(30),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    opacity: z.number().min(0).max(1),
    lineHeight: z.number().min(0.8).max(2),
  })
  .refine(
    (v) => v.minFontSize <= v.fontSize,
    "Minimum font size must not exceed preferred font size",
  );
export const templateSchema = z.object({
  name: layer,
  brand: layer,
  size: layer,
  cover: z.object({
    enabled: z.boolean(),
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1).max(6000),
    height: z.number().min(1).max(6000),
    sourceX: z.number().min(0),
    sourceY: z.number().min(0),
    sourceWidth: z.number().min(1).max(6000),
    sourceHeight: z.number().min(1).max(6000),
  }),
  blend: z.enum(["over", "multiply"]),
  blur: z.number().min(0).max(2),
});
export const productSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(80),
  type: z.enum(["Perfume", "Attar", "Gift Set"]),
  summary: text,
  description: text,
  notes: z.object({ top: text, heart: text, base: text }),
  occasion: text,
  longevity: text,
  badges: z.array(z.string().max(40)).max(5),
  active: z.boolean(),
  featured: z.boolean(),
  variants: z
    .array(
      z.object({
        size: z.number().refine((n) => [0, 6, 12, 20, 50, 100].includes(n)),
        price: z.number().int().min(0).max(1000000),
        mrp: z.number().int().min(0).max(1000000),
        stock: z.number().int().min(0).max(1000000),
        enabled: z.boolean(),
        image: z.string().max(300),
        imageSize: z.number().nullable(),
      }),
    )
    .max(6)
    .refine(
      (v) => new Set(v.map((x) => x.size)).size === v.length,
      "Duplicate sizes",
    ),
});
export const importSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1).max(100),
      category: z.string().trim().min(1).max(80),
      type: z.enum(["Perfume", "Attar", "Gift Set"]).default("Perfume"),
    }),
  )
  .min(1)
  .max(500);
export function errorResponse(e: unknown) {
  if (e instanceof Error && (e.name.startsWith("Prisma") || "code" in e)) {
    console.error("Admin request failed:", e.name);
    return Response.json(
      { error: "The request could not be completed. Please try again." },
      { status: 500 },
    );
  }
  const message =
    e instanceof z.ZodError
      ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
      : e instanceof Error
        ? e.message
        : "Something went wrong";
  const status =
    message === "Unauthorized"
      ? 401
      : message === "Untrusted request origin"
        ? 403
        : 400;
  return Response.json({ error: message }, { status });
}

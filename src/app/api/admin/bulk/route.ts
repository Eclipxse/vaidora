import { db } from "@/lib/db";
import { requireAdmin, sameOrigin } from "@/lib/auth";
import { errorResponse } from "@/lib/validation";
import { parseImport, validateRows } from "@/lib/import";
import { z } from "zod";
import { type Plan, proof } from "@/lib/generation";
import { type TemplateRecord, slugify } from "@/lib/types";
export const runtime = "nodejs";
export async function GET(r: Request) {
  try {
    await requireAdmin();
    const url = new URL(r.url),
      id = url.searchParams.get("id");
    if (id) {
      const job = await db.generationJob.findUniqueOrThrow({ where: { id } });
      if (url.searchParams.has("proof")) {
        const data = await proof(
          job.plan as unknown as Plan,
          Number(url.searchParams.get("proof") || 0),
        );
        return new Response(new Uint8Array(data), {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "private, no-store",
          },
        });
      }
      return Response.json(job);
    }
    return Response.json(
      await db.generationJob.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(r: Request) {
  try {
    await requireAdmin();
    sameOrigin(r);
    if (r.headers.get("content-type")?.includes("multipart/form-data")) {
      const f = (await r.formData()).get("file");
      if (!(f instanceof File)) throw new Error("Select a CSV or XLSX file.");
      return Response.json({ rows: await parseImport(f) });
    }
    const body = await r.json();
    if (body.action === "generate" || body.action === "retry") {
      const job = await db.generationJob.findUniqueOrThrow({
        where: { id: z.string().parse(body.id) },
      });
      if (!["preview", "failed"].includes(job.status))
        throw new Error("This batch has already been approved.");
      await db.generationJob.update({
        where: { id: job.id },
        data: { status: "queued", error: "" },
      });
      return Response.json({ id: job.id, status: "queued" });
    }
    const rows = validateRows(body.rows);
    const sizes = z
      .array(z.number().refine((n) => [6, 12, 20, 50, 100].includes(n)))
      .min(1)
      .max(5)
      .parse(body.sizes);
    if (new Set(sizes).size !== sizes.length)
      throw new Error("Select each size only once.");
    const templates = await db.imageTemplate.findMany({
      where: { size: { in: sizes }, ready: true },
    });
    if (templates.length !== sizes.length)
      throw new Error(
        "Every selected size needs an approved template with a master photograph.",
      );
    const prices = z
      .record(
        z.string(),
        z.object({
          price: z.number().int().min(0).max(1000000),
          mrp: z.number().int().min(0).max(1000000),
          stock: z.number().int().min(0).max(1000000),
        }),
      )
      .parse(body.prices);
    const existing = await db.product.findMany({
      where: { slug: { in: rows.map((row) => slugify(row.name)) } },
      select: { slug: true, name: true },
    });
    for (const p of existing) {
      const row = rows.find((row) => slugify(row.name) === p.slug)!;
      if (row.name.toLowerCase() !== p.name.toLowerCase())
        throw new Error(
          `The name “${row.name}” conflicts with existing product “${p.name}”.`,
        );
    }
    const plan: Plan = {
      rows,
      templates: templates as unknown as TemplateRecord[],
      prices,
      publish: !!body.publish,
    };
    await proof(plan, 0);
    const job = await db.generationJob.create({
      data: {
        plan: JSON.parse(JSON.stringify(plan)),
        total: rows.length * sizes.length,
      },
    });
    return Response.json({ ...job, existing: existing.length });
  } catch (e) {
    return errorResponse(e);
  }
}

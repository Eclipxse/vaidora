import { requireAdmin, sameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { templateSchema, errorResponse } from "@/lib/validation";
import { compose } from "@/lib/compositor";
import { type TemplateRecord } from "@/lib/types";
import { z } from "zod";
export async function POST(r: Request) {
  try {
    await requireAdmin();
    sameOrigin(r);
    const v = z
      .object({
        id: z.string(),
        name: z.string().min(1).max(100),
        config: templateSchema,
      })
      .parse(await r.json());
    const t = await db.imageTemplate.findUniqueOrThrow({ where: { id: v.id } });
    const data = await compose(
      { ...t, config: v.config } as unknown as TemplateRecord,
      v.name,
    );
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

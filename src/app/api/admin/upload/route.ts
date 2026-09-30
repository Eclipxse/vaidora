import { requireAdmin, sameOrigin } from "@/lib/auth";
import { errorResponse } from "@/lib/validation";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { publicFile } from "@/lib/compositor";
export const runtime = "nodejs";
export async function POST(r: Request) {
  try {
    await requireAdmin();
    sameOrigin(r);
    if (Number(r.headers.get("content-length") || 0) > 21000000)
      throw new Error("Upload must be smaller than 20 MB.");
    const data = await r.formData();
    const f = data.get("file");
    if (!(f instanceof File) || f.size > 20000000)
      throw new Error("Choose a JPG, PNG or WebP image under 20 MB.");
    const buffer = Buffer.from(await f.arrayBuffer());
    const meta = await sharp(buffer, { limitInputPixels: 30000000 }).metadata();
    if (
      !["png", "jpeg", "webp"].includes(meta.format || "") ||
      !meta.width ||
      !meta.height ||
      meta.width > 6000 ||
      meta.height > 6000
    )
      throw new Error("Use a PNG, JPG or WebP up to 6000 pixels on each side.");
    const url = `/uploads/${randomUUID()}.${meta.format === "jpeg" ? "jpg" : meta.format}`;
    await mkdir("public/uploads", { recursive: true });
    await writeFile(publicFile(url), buffer);
    return Response.json({ url, width: meta.width, height: meta.height });
  } catch (e) {
    return errorResponse(e);
  }
}

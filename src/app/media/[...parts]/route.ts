import { publicFile } from "@/lib/compositor";
import { readFile, stat } from "node:fs/promises";
export const runtime = "nodejs";
export async function GET(
  r: Request,
  { params }: { params: Promise<{ parts: string[] }> },
) {
  try {
    const parts = (await params).parts;
    const url = "/" + parts.join("/");
    if (!/^\/(products|uploads)\//.test(url))
      return new Response("Not found", { status: 404 });
    const file = publicFile(url),
      info = await stat(file),
      etag = `"${info.size}-${info.mtimeMs}"`;
    if (r.headers.get("if-none-match") === etag)
      return new Response(null, { status: 304 });
    const contentType = file.endsWith(".webp")
      ? "image/webp"
      : file.endsWith(".png")
        ? "image/png"
        : "image/jpeg";
    return new Response(new Uint8Array(await readFile(file)), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        ETag: etag,
        "Cache-Control": new URL(r.url).searchParams.has("v")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Image not found", { status: 404 });
  }
}

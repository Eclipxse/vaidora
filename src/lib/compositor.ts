import sharp from "sharp";
import { createCanvas } from "@napi-rs/canvas";
import path from "node:path";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { fitText } from "./template-layout";
import type { TemplateRecord, TextLayer } from "./types";
export function publicFile(url: string) {
  if (
    !/^\/(masters|uploads|products)\/[a-zA-Z0-9_./-]+(?:\?v=[a-f0-9]{12})?$/.test(
      url,
    ) ||
    url.includes("..")
  )
    throw new Error("Invalid image path");
  const root = path.resolve("public");
  const p = path.resolve(root, `.${url.split("?")[0]}`);
  if (!p.startsWith(root + path.sep)) throw new Error("Invalid image path");
  return p;
}
export async function compose(
  template: TemplateRecord,
  name: string,
): Promise<Buffer> {
  if (!template.base)
    throw new Error(`Upload the ${template.size} ML master first.`);
  const master = await readFile(publicFile(template.base));
  const meta = await sharp(master).metadata();
  const width = meta.width!,
    height = meta.height!;
  const c = template.config;
  let base = sharp(master);
  const cover = c.cover;
  if (cover.enabled) {
    const src = {
      left: Math.round(cover.sourceX),
      top: Math.round(cover.sourceY),
      width: Math.round(cover.sourceWidth),
      height: Math.round(cover.sourceHeight),
    };
    if (
      src.left < 0 ||
      src.top < 0 ||
      src.left + src.width > width ||
      src.top + src.height > height ||
      cover.x + cover.width > width ||
      cover.y + cover.height > height
    )
      throw new Error("Label cover is outside the master photograph.");
    const patch = await sharp(master)
      .extract(src)
      .resize(Math.round(cover.width), Math.round(cover.height), {
        fit: "fill",
      })
      .toBuffer();
    base = sharp(
      await base
        .composite([
          { input: patch, left: Math.round(cover.x), top: Math.round(cover.y) },
        ])
        .png()
        .toBuffer(),
    );
  }
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  function draw(text: string, l: TextLayer) {
    if (!l.enabled) return;
    const measure = (text: string, size: number) => {
      ctx.font = `${l.weight} ${size}px "${l.font}"`;
      return ctx.measureText(text).width;
    };
    const fit = fitText(text, l, measure);
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate((l.rotation * Math.PI) / 180);
    ctx.transform(1, 0, Math.tan((l.skew * Math.PI) / 180), 1, 0, 0);
    ctx.font = `${l.weight} ${fit.size}px "${l.font}"`;
    ctx.fillStyle = l.color;
    ctx.globalAlpha = l.opacity;
    ctx.textBaseline = "middle";
    fit.lines.forEach((line, i) => {
      const chars = [...line];
      const total =
        ctx.measureText(line).width + Math.max(0, chars.length - 1) * l.spacing;
      let x =
        l.align === "center" ? -total / 2 : l.align === "right" ? -total : 0;
      const y = (i - (fit.lines.length - 1) / 2) * fit.size * l.lineHeight;
      for (const char of chars) {
        ctx.fillText(char, x, y);
        x += ctx.measureText(char).width + l.spacing;
      }
    });
    ctx.restore();
  }
  draw(name.toUpperCase(), c.name);
  draw("Vaidora Perfume", c.brand);
  draw(`${template.size} ML`, c.size);
  let overlay = canvas.toBuffer("image/png");
  if (c.blur >= 0.3)
    overlay = await sharp(overlay).blur(c.blur).png().toBuffer();
  return base
    .composite([{ input: overlay, blend: c.blend }])
    .webp({ lossless: true, effort: 4 })
    .toBuffer();
}
export async function exportImage(
  template: TemplateRecord,
  name: string,
  slug: string,
) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("Invalid product slug");
  const url = `/products/${slug}/${template.size}ml.webp`;
  const file = publicFile(url);
  await mkdir(path.dirname(file), { recursive: true });
  const temp = file + `.${randomUUID()}.tmp`;
  const bytes = await compose(template, name);
  await writeFile(temp, bytes);
  await rename(temp, file);
  return `${url}?v=${createHash("sha256").update(bytes).digest("hex").slice(0, 12)}`;
}

import "dotenv/config";
import assert from "node:assert/strict";
import { writeFile, unlink } from "node:fs/promises";
import sharp from "sharp";
import { db } from "../src/lib/db";
import { publicFile } from "../src/lib/compositor";
const base = process.env.APP_ORIGIN!;
let cookie = "",
  jobId = "",
  uploadedUrl = "";
const qaName = `Vaidora QA ${Date.now()}`;
const checks: string[] = [];
async function req(path: string, body?: unknown, origin = base, auth = true) {
  return fetch(base + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body === undefined
        ? {}
        : { "Content-Type": "application/json", Origin: origin }),
      ...(auth ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(180000),
  });
}
async function pass(name: string) {
  checks.push(name);
  console.log(`PASS ${name}`);
}
async function main() {
  for (const path of [
    "/",
    "/collections",
    "/collections/women",
    "/collections/men",
    "/collections/unisex",
    "/collections?size=0",
    "/products/good-girl",
    "/search?q=good",
    "/wishlist",
    "/bundle",
    "/about",
    "/contact",
    "/faq",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/policies/terms",
  ]) {
    const r = await req(path);
    assert.equal(r.status, 200, path);
    await r.text();
  }
  await pass("17 public routes return 200");
  for (const source of [
    "/vaidora-logo-transparent.png",
    "/media/products/good-girl/100ml.webp",
  ]) {
    const optimized = await fetch(
      `${base}/_next/image?url=${encodeURIComponent(source)}&w=384&q=75`,
      {
        headers: { Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
        signal: AbortSignal.timeout(15000),
      },
    );
    assert.equal(optimized.status, 200, source);
    assert.equal(optimized.headers.get("content-type"), "image/webp");
    const metadata = await sharp(
      Buffer.from(await optimized.arrayBuffer()),
    ).metadata();
    assert(metadata.width && metadata.height, source);
  }
  await pass("Browser image negotiation serves decodable logo and product images");
  let r = await req("/api/admin/products", undefined, base, false);
  assert.equal(r.status, 401);
  await pass("Unauthenticated admin API denied");
  r = await req("/api/admin/session", {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  assert.equal(r.status, 200, await r.text());
  cookie = r.headers.get("set-cookie")!.split(";")[0];
  assert(r.headers.get("set-cookie")!.includes("HttpOnly"));
  assert(r.headers.get("set-cookie")!.includes("SameSite=strict"));
  await pass("Owner login returns protected session cookie");
  const uploadBytes = await sharp({
    create: { width: 16, height: 16, channels: 3, background: "#7a3025" },
  })
    .png()
    .toBuffer();
  const upload = new FormData();
  upload.set(
    "file",
    new File([new Uint8Array(uploadBytes)], "verification.png", {
      type: "image/png",
    }),
  );
  r = await fetch(base + "/api/admin/upload", {
    method: "POST",
    headers: { Origin: base, Cookie: cookie },
    body: upload,
  });
  assert.equal(r.status, 200);
  const uploaded = await r.json();
  uploadedUrl = uploaded.url;
  assert.match(uploadedUrl, /^\/uploads\/[a-f0-9-]+\.png$/);
  assert.equal(uploaded.width, 16);
  assert.equal(uploaded.height, 16);
  r = await req("/media" + uploadedUrl);
  assert.equal(r.status, 200);
  assert.deepEqual(Buffer.from(await r.arrayBuffer()), uploadBytes);
  await pass("Authenticated upload persists and serves the original image");
  const all = await (await req("/api/admin/products")).json();
  const active = all.filter((p: any) => p.active && !p.archived);
  assert.equal(active.length, 87);
  assert.equal(
    active.flatMap((p: any) => p.variants.filter((v: any) => v.enabled)).length,
    522,
  );
  assert.deepEqual(
    ["Men", "Women", "Unisex"].map(
      (c) => active.filter((p: any) => p.category === c).length,
    ),
    [33, 24, 30],
  );
  await pass("87 fragrances / 522 enabled options / confirmed categories");
  const settings = await (await req("/api/admin/settings")).json();
  assert.equal(settings.whatsapp, "917863065807");
  r = await req("/api/admin/settings", settings, "https://untrusted.example");
  assert.equal(r.status, 403);
  await pass("Cross-origin mutation denied");
  for (const path of [
    "/admin",
    "/admin/products",
    "/admin/templates",
    "/admin/bulk",
    "/admin/content",
  ]) {
    const response = await req(path);
    assert.equal(response.status, 200, path);
  }
  await pass("Authenticated admin pages render");
  const templates = await (await req("/api/admin/templates")).json();
  assert.deepEqual(
    templates.filter((t: any) => t.ready).map((t: any) => t.size),
    [12, 100],
  );
  const prices = {
    "12": { price: 250, mrp: 250, stock: 0 },
    "100": { price: 900, mrp: 900, stock: 0 },
  };
  r = await req("/api/admin/bulk", {
    rows: [{ name: qaName, category: "Unisex", type: "Perfume" }],
    sizes: [12, 100],
    prices,
    publish: false,
  });
  const job = await r.json();
  assert.equal(r.status, 200, JSON.stringify(job));
  assert.equal(job.status, "preview");
  jobId = job.id;
  r = await req(`/api/admin/bulk?id=${jobId}&proof=0`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "image/webp");
  assert((await r.arrayBuffer()).byteLength > 10000);
  await pass("Bulk import proof generated before approval");
  assert.equal(await db.product.count({ where: { name: qaName } }), 0);
  r = await req("/api/admin/bulk", { action: "generate", id: jobId });
  assert.equal(r.status, 200);
  let state = "";
  for (let i = 0; i < 60; i++) {
    const latest = await (await req(`/api/admin/bulk?id=${jobId}`)).json();
    state = latest.status;
    if (["complete", "failed"].includes(state)) {
      assert.equal(state, "complete", latest.error);
      assert.equal(latest.completed, 2);
      break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.equal(state, "complete");
  await pass(
    "Approved background job creates one grouped product with two images",
  );
  const product = await db.product.findFirstOrThrow({
    where: { name: qaName },
    include: { variants: true },
  });
  assert.equal(product.active, false);
  assert.equal(product.variants.length, 2);
  for (const v of product.variants) {
    r = await req("/media" + v.image);
    assert.equal(r.status, 200, v.image);
    assert((await r.arrayBuffer()).byteLength > 10000);
    assert(r.headers.get("etag"));
    assert(r.headers.get("cache-control")?.includes("immutable"));
  }
  await pass("New image files served without restarting the application");
  const edit = {
    ...product,
    summary: "Local verification fixture",
    notes: { top: "", heart: "", base: "" },
    badges: [],
    active: false,
    featured: false,
  };
  r = await req("/api/admin/products", { id: product.id, product: edit });
  assert.equal(r.status, 200, await r.text());
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: product.id } })).summary,
    edit.summary,
  );
  await pass("Product edit persists");
  r = await req("/api/admin/products", {
    action: "archive",
    id: product.id,
    archived: true,
  });
  assert.equal(r.status, 200);
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: product.id } }))
      .archived,
    true,
  );
  await pass("Product archive works");
  r = await req("/products/nonexistent-test");
  const missing = await r.text();
  assert(missing.includes("This page has wandered."));
  assert(missing.includes("noindex"));
  for (const path of ["/api/admin/not-a-resource", "/media/products/../.env"]) {
    r = await req(path);
    assert(r.status >= 400, path);
  }
  await pass(
    "Missing product renders noindex fallback; invalid API and media paths rejected",
  );
  r = await fetch(base + "/api/admin/session", {
    method: "DELETE",
    headers: { Origin: base, Cookie: cookie },
  });
  assert.equal(r.status, 200);
  await pass("Owner logout clears session");
  await writeFile(
    "docs/INTEGRATION_RESULTS.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        checks,
        visualVerification:
          "HTTP and API checks only; rendered browser verification is recorded separately.",
        externalMessagesSent: 0,
      },
      null,
      2,
    ),
  );
}
main().finally(async () => {
  if (uploadedUrl) await unlink(publicFile(uploadedUrl)).catch(() => {});
  const fixture = await db.product.findFirst({
    where: { name: qaName },
    include: { variants: true },
  });
  if (fixture) {
    for (const v of fixture.variants) {
      await unlink(publicFile(v.image)).catch(() => {});
    }
    await db.product.delete({ where: { id: fixture.id } });
  }
  if (jobId) await db.generationJob.delete({ where: { id: jobId } });
  await db.$disconnect();
});

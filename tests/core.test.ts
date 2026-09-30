import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { createCanvas } from "@napi-rs/canvas";
import { fitText, layer, defaultTemplate } from "../src/lib/template-layout";
import {
  slugify,
  productMessage,
  whatsappUrl,
  type TemplateRecord,
} from "../src/lib/types";
import { compose, publicFile } from "../src/lib/compositor";
import { validateRows, parseImport } from "../src/lib/import";
import { templateSchema } from "../src/lib/validation";
import ExcelJS from "exceljs";
test("all 87 source records and 522 prices preserve the supplied catalog", async () => {
  const source = JSON.parse(await readFile("docs/catalog-source.json", "utf8"));
  assert.equal(source.records.length, 87);
  assert.equal(
    new Set(source.records.map((r: { name: string }) => slugify(r.name))).size,
    87,
  );
  assert.deepEqual(
    source.records.map((r: { number: number }) => r.number),
    Array.from({ length: 87 }, (_, i) => i + 1),
  );
  assert.deepEqual(
    source.records.reduce(
      (acc: Record<string, number>, r: { category: string }) => ({
        ...acc,
        [r.category]: (acc[r.category] || 0) + 1,
      }),
      {},
    ),
    { Men: 33, Unisex: 30, Women: 24 },
  );
  for (const r of source.records)
    assert.deepEqual(r.prices, {
      "0": 250,
      "6": 200,
      "12": 250,
      "20": 250,
      "50": 650,
      "100": 900,
    });
});
test("long catalog names fit both real bottle label widths", async () => {
  const source = JSON.parse(await readFile("docs/catalog-source.json", "utf8"));
  const ctx = createCanvas(100, 100).getContext("2d");
  for (const width of [302, 500])
    for (const row of source.records) {
      const l = layer({ maxWidth: width, minFontSize: 15 });
      const measure = (text: string, size: number) => {
        ctx.font = `700 ${size}px Arial`;
        return ctx.measureText(text).width;
      };
      const result = fitText(row.name, l, measure);
      assert.ok(result.lines.length <= l.maxLines);
      for (const line of result.lines)
        assert.ok(measure(line, result.size) <= width, `${row.name} overflows`);
    }
});
test("impossible label text fails instead of silently clipping", () =>
  assert.throws(
    () =>
      fitText(
        "IMPOSSIBLYLONGUNBROKENFRAGRANCENAME",
        layer({ maxWidth: 20, minFontSize: 18 }),
        (s) => s.length * 18,
      ),
    /does not fit/,
  ));
test("WhatsApp message carries exact product, variant, quantity and page", () => {
  const msg = productMessage(
    { name: "L'EAU D'ISSEY POUR HOMME", slug: "l-eau-d-issey-pour-homme" },
    { size: 50, price: 650 },
    2,
    "https://example.com",
  );
  const url = new URL(whatsappUrl("+91 78630 65807", msg));
  assert.equal(url.pathname, "/917863065807");
  assert.equal(url.searchParams.get("text"), msg);
  assert.match(msg, /Option: 50 ML/);
  assert.match(msg, /Quantity: 2/);
  assert.match(msg, /₹650 each/);
  assert.match(msg, /\?size=50/);
  const diffuser = productMessage(
    { name: "GOOD GIRL", slug: "good-girl" },
    { size: 0, price: 250 },
    1,
    "https://example.com",
  );
  assert.match(diffuser, /Option: Car diffuser/);
  assert.doesNotMatch(diffuser, /0 ML/);
});
test("duplicate normalized product names are rejected", () =>
  assert.throws(
    () =>
      validateRows([
        { name: "A&B", category: "Men" },
        { name: "A B", category: "Men" },
      ]),
    /Duplicate/,
  ));
test("server file access prevents traversal and remote URLs", () => {
  for (const path of [
    "/uploads/../.env",
    "https://example.com/image.png",
    "/etc/passwd",
    "/uploads/../../private/secret",
    "/uploads/a.svg?test",
  ])
    assert.throws(() => publicFile(path));
  assert.ok(publicFile("/masters/100ml.png").endsWith("100ml.png"));
});
test("CSV import preserves punctuation and Unicode", async () => {
  const file = new File(
    [
      'name,category,type\n"OUD & ROSES",Unisex,Perfume\n"L.V OMBRÉ NOMADE",Unisex,Perfume',
    ],
    "catalog.csv",
  );
  const rows = await parseImport(file);
  assert.equal(rows[1].name, "L.V OMBRÉ NOMADE");
  assert.equal(rows[0].name, "OUD & ROSES");
});
test("XLSX import uses the first sheet and header columns", async () => {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Catalog");
  sheet.addRow(["name", "category", "type"]);
  sheet.addRow(["GOOD GIRL", "Women", "Perfume"]);
  const bytes = await wb.xlsx.writeBuffer();
  const rows = await parseImport(
    new File([new Uint8Array(bytes as ArrayBuffer)], "catalog.xlsx"),
  );
  assert.equal(rows[0].name, "GOOD GIRL");
  assert.equal(rows[0].category, "Women");
});
test("template validation refuses inverted font limits", () => {
  const c = defaultTemplate(100);
  c.name.minFontSize = 100;
  c.name.fontSize = 30;
  assert.equal(templateSchema.safeParse(c).success, false);
});
test("server compositor retains original pixels outside the edited label", async () => {
  const c = defaultTemplate(100);
  c.cover.enabled = true;
  const t = {
    id: "test",
    size: 100,
    name: "Test",
    base: "/masters/100ml.png",
    width: 1122,
    height: 1402,
    config: c,
    ready: true,
    revision: 1,
  } satisfies TemplateRecord;
  const [before, after] = await Promise.all([
    sharp("public/masters/100ml.png")
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
    compose(t, "GOOD GIRL").then((b) =>
      sharp(b).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    ),
  ]);
  assert.deepEqual(after.info, before.info);
  let changedOutside = 0,
    changedInside = 0;
  for (let y = 0; y < before.info.height; y++)
    for (let x = 0; x < before.info.width; x++) {
      const i = (y * before.info.width + x) * 3;
      const differs =
        before.data[i] !== after.data[i] ||
        before.data[i + 1] !== after.data[i + 1] ||
        before.data[i + 2] !== after.data[i + 2];
      if (differs) {
        if (
          x >= c.cover.x &&
          x < c.cover.x + c.cover.width &&
          y >= c.cover.y &&
          y < c.cover.y + c.cover.height
        )
          changedInside++;
        else changedOutside++;
      }
    }
  assert.ok(changedInside > 0);
  assert.equal(
    changedOutside,
    0,
    "Pixels outside the configured label changed",
  );
});

import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";
import { importSchema } from "./validation";
import { slugify } from "./types";
export async function parseImport(file: File) {
  if (file.size > 2000000) throw new Error("Import files must be under 2 MB.");
  let rows: Record<string, unknown>[] = [];
  if (file.name.toLowerCase().endsWith(".csv")) {
    rows = parse(await file.text(), {
      columns: (h) => h.map((s: string) => s.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } else if (file.name.toLowerCase().endsWith(".xlsx")) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(Buffer.from(await file.arrayBuffer()) as never);
    const sheet = wb.worksheets[0];
    if (!sheet) throw new Error("Workbook has no sheets.");
    if (sheet.rowCount > 501)
      throw new Error("Import a maximum of 500 fragrances at once.");
    const headers = (sheet.getRow(1).values as unknown[])
      .slice(1)
      .map((x) => String(x).trim().toLowerCase());
    sheet.eachRow((r, i) => {
      if (i > 1) {
        const row: Record<string, unknown> = {};
        headers.forEach((h, j) => (row[h] = r.getCell(j + 1).text.trim()));
        rows.push(row);
      }
    });
  } else throw new Error("Choose a CSV or XLSX file.");
  return validateRows(rows);
}
export function validateRows(rows: unknown) {
  const valid = importSchema.parse(rows);
  const seen = new Set<string>();
  for (const row of valid) {
    const slug = slugify(row.name);
    if (!slug) throw new Error("Names must contain letters or numbers.");
    if (seen.has(slug))
      throw new Error(`Duplicate or conflicting name: ${row.name}`);
    seen.add(slug);
  }
  return valid;
}

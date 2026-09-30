import { db } from "@/lib/db";
import { TemplatesAdmin } from "@/components/admin/templates";
export default async function Templates() {
  return (
    <TemplatesAdmin
      templates={JSON.parse(
        JSON.stringify(
          await db.imageTemplate.findMany({ orderBy: { size: "asc" } }),
        ),
      )}
    />
  );
}

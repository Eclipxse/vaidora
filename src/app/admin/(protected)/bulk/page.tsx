import { db } from "@/lib/db";
import { BulkAdmin } from "@/components/admin/bulk";
export default async function Bulk() {
  const [templates, jobs] = await Promise.all([
    db.imageTemplate.findMany({ orderBy: { size: "asc" } }),
    db.generationJob.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  return (
    <BulkAdmin
      templates={JSON.parse(JSON.stringify(templates))}
      jobs={JSON.parse(JSON.stringify(jobs))}
    />
  );
}

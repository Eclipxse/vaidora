import { db } from "./db";
import { exportImage, compose } from "./compositor";
import { slugify, type TemplateRecord } from "./types";
export type Plan = {
  rows: { name: string; category: string; type: string }[];
  templates: TemplateRecord[];
  prices: Record<string, { price: number; mrp: number; stock: number }>;
  publish: boolean;
};
export async function processNextJob() {
  const stale = new Date(Date.now() - 300000);
  const candidate = await db.generationJob.findFirst({
    where: {
      OR: [
        { status: "queued" },
        { status: "running", lockedAt: { lt: stale } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  if (!candidate) return false;
  const claimed = await db.generationJob.updateMany({
    where: {
      id: candidate.id,
      status: candidate.status,
      lockedAt: candidate.lockedAt,
    },
    data: { status: "running", lockedAt: new Date() },
  });
  if (!claimed.count) return false;
  const plan = candidate.plan as unknown as Plan;
  try {
    const tasks = plan.rows.flatMap((row) =>
      plan.templates.map((template) => ({ row, template })),
    );
    for (let i = candidate.completed; i < tasks.length; i++) {
      const { row, template } = tasks[i];
      const slug = slugify(row.name);
      const image = await exportImage(template, row.name, slug);
      const price = plan.prices[template.size] || {
        price: 0,
        mrp: 0,
        stock: 0,
      };
      await db.$transaction(async (tx) => {
        const product = await tx.product.upsert({
          where: { slug },
          update: {},
          create: {
            slug,
            name: row.name,
            category: row.category,
            type: row.type,
            active: plan.publish,
            description: `Discover ${row.name} with Vaidora. Contact us for the fragrance profile and availability.`,
            summary: "Find your next signature.",
            notes: { top: "", heart: "", base: "" },
            badges: [],
          },
        });
        await tx.productVariant.upsert({
          where: {
            productId_size: { productId: product.id, size: template.size },
          },
          create: {
            productId: product.id,
            size: template.size,
            ...price,
            image,
            imageSize: template.size,
          },
          update: { ...price, image, imageSize: template.size, enabled: true },
        });
        await tx.generationJob.update({
          where: { id: candidate.id },
          data: { completed: i + 1, lockedAt: new Date() },
        });
      });
    }
    await db.generationJob.update({
      where: { id: candidate.id },
      data: { status: "complete", error: "", lockedAt: null },
    });
  } catch (e) {
    await db.generationJob.update({
      where: { id: candidate.id },
      data: {
        status: "failed",
        error: e instanceof Error ? e.message : "Generation failed",
        lockedAt: null,
      },
    });
  }
  return true;
}
export async function proof(plan: Plan, index: number) {
  const tasks = plan.rows.flatMap((row) =>
    plan.templates.map((template) => ({ row, template })),
  );
  const task = tasks[Math.min(Math.max(0, index), tasks.length - 1)];
  return compose(task.template, task.row.name);
}

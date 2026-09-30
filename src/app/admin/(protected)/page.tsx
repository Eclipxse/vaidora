import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { ArrowUpRight } from "@/components/icons";
export default async function Dashboard() {
  const [products, variants, templates, low, jobs, s] = await Promise.all([
    db.product.count({ where: { archived: false } }),
    db.productVariant.count({ where: { enabled: true } }),
    db.imageTemplate.count({ where: { ready: true } }),
    db.productVariant.count({ where: { enabled: true, stock: { lte: 5 } } }),
    db.generationJob.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    getSettings(),
  ]);
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="small muted">YOUR FRAGRANCE BUSINESS</span>
          <h1>The owner studio.</h1>
          <p>A home for your products, photography and store content.</p>
        </div>
        <Link className="button" href="/admin/bulk">
          Create products
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="stat-grid">
        {[
          ["Fragrances", products],
          ["Enabled variants", variants],
          ["Ready templates", `${templates} / 5`],
          ["Low / unconfirmed stock", low],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {s.previewMode && (
        <div className="admin-notice">
          Preview mode is on. Confirm product names, imagery, prices and
          policies before turning it off in Store settings.
        </div>
      )}
      <div className="admin-two-col">
        <section className="admin-panel">
          <h2>Your product image workflow</h2>
          <ol className="workflow-list">
            <li>
              <Link href="/admin/templates">
                <strong>Set up bottle templates</strong>
                <span>
                  Upload the master for each size, position text, then check an
                  exported proof.
                </span>
              </Link>
            </li>
            <li>
              <Link href="/admin/bulk">
                <strong>Import fragrance names</strong>
                <span>
                  Paste a list or upload CSV / XLSX. Preview the images before
                  approving.
                </span>
              </Link>
            </li>
            <li>
              <Link href="/admin/products">
                <strong>Manage your collection</strong>
                <span>
                  Review prices and stock, publish products and keep your
                  catalog up to date.
                </span>
              </Link>
            </li>
          </ol>
        </section>
        <section className="admin-panel">
          <h2>Recent image batches</h2>
          {jobs.length ? (
            jobs.map((j) => (
              <Link className="job-row" href="/admin/bulk" key={j.id}>
                <strong>
                  {j.completed} / {j.total} images
                </strong>
                <span className="status-chip">{j.status}</span>
              </Link>
            ))
          ) : (
            <p className="muted">
              No batches yet. Your first approved generation will appear here.
            </p>
          )}
          <p className="small muted" style={{ marginTop: 24 }}>
            Orders happen on WhatsApp. Opening an enquiry does not create an
            order or reduce inventory.
          </p>
        </section>
      </div>
    </>
  );
}

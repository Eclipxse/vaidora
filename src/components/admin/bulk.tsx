"use client";
import { useEffect, useState } from "react";
import { type TemplateRecord } from "@/lib/types";
import { request, Notice } from "./helpers";
import Link from "next/link";
type Job = {
  id: string;
  status: string;
  completed: number;
  total: number;
  error: string;
  existing?: number;
  plan: {
    rows: { name: string; category: string }[];
    templates: TemplateRecord[];
  };
};
export function BulkAdmin({
  templates,
  jobs: initial,
}: {
  templates: TemplateRecord[];
  jobs: Job[];
}) {
  const [text, setText] = useState(
      "Good Girl,Women\nBlack Opium,Women\nSauvage,Men\nBleu,Men\nOud Wood,Unisex",
    ),
    [sizes, setSizes] = useState<number[]>(
      templates.filter((t) => t.ready).map((t) => t.size),
    ),
    [prices, setPrices] = useState<
      Record<string, { price: number; mrp: number; stock: number }>
    >(
      Object.fromEntries(
        templates.map((t) => [t.size, { price: 0, mrp: 0, stock: 0 }]),
      ),
    ),
    [job, setJob] = useState<Job | null>(null),
    [jobs, setJobs] = useState(initial),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [approved, setApproved] = useState(false),
    [publish, setPublish] = useState(false);
  const rows = text
    .split("\n")
    .filter((x) => x.trim())
    .map((line) => {
      const [name, category, type] = line.split(",").map((x) => x.trim());
      return { name, category: category || "Unisex", type: type || "Perfume" };
    })
    .filter((row) => row.name.toLowerCase() !== "name");
  useEffect(() => {
    if (!job || !["running", "queued"].includes(job.status)) return;
    const timer = setInterval(async () => {
      try {
        const next = await request<Job>(
          `/api/admin/bulk?id=${job.id}`,
          undefined,
          "GET",
        );
        setJob(next);
        if (["complete", "failed"].includes(next.status)) {
          setJobs(await request<Job[]>("/api/admin/bulk", undefined, "GET"));
          setMessage(
            next.status === "complete"
              ? "Generation complete. Your products are ready to review."
              : next.error,
          );
        }
      } catch (e) {
        setMessage((e as Error).message);
      }
    }, 1800);
    return () => clearInterval(timer);
  }, [job?.id, job?.status]);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Bulk product generator</h1>
          <p>
            One list of names. Real bottle photographs. Every selected size.
          </p>
        </div>
        <Link className="button outline" href="/admin/templates">
          Manage templates
        </Link>
      </div>
      <Notice message={message} />
      <div className="admin-two-col">
        <section className="admin-panel">
          <h2>1. Your fragrances</h2>
          <p className="small muted">
            One per line: name,category,type. Type is Perfume, Attar or Gift
            Set.
          </p>
          <label>
            Fragrance names
            <textarea
              className="bulk-names"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setApproved(false);
                setJob(null);
              }}
            />
          </label>
          <label>
            Or upload CSV / XLSX
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                run(async () => {
                  const form = new FormData();
                  form.set("file", f);
                  const data = await request<{
                    rows: { name: string; category: string; type: string }[];
                  }>("/api/admin/bulk", form);
                  setText(
                    data.rows
                      .map((r) => `${r.name},${r.category},${r.type}`)
                      .join("\n"),
                  );
                  setJob(null);
                  setApproved(false);
                  setMessage(`${data.rows.length} fragrance names imported.`);
                });
              }}
            />
          </label>
          <p className="small muted">
            CSV headers: name,category,type. Import validates duplicate names
            and limits each batch to 500 fragrances.
          </p>
        </section>
        <section className="admin-panel">
          <h2>2. Choose bottle sizes</h2>
          <div className="size-checks">
            {templates.map((t) => (
              <label key={t.id} className="check-label">
                <input
                  type="checkbox"
                  disabled={!t.ready}
                  checked={sizes.includes(t.size)}
                  onChange={(e) => {
                    setSizes(
                      e.target.checked
                        ? [...sizes, t.size]
                        : sizes.filter((x) => x !== t.size),
                    );
                    setJob(null);
                    setApproved(false);
                  }}
                />
                <strong>{t.size} ML</strong>
                <span className="small muted">
                  {t.ready ? "Template ready" : "Master image needed"}
                </span>
              </label>
            ))}
          </div>
          <div className="batch-count">
            <strong>{rows.length}</strong> fragrances ×{" "}
            <strong>{sizes.length}</strong> sizes
            <span>{rows.length * sizes.length} variants</span>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => {
                setPublish(e.target.checked);
                setJob(null);
                setApproved(false);
              }}
            />
            Publish new products after generation
          </label>
          <p className="small muted">
            Existing names are matched to their fragrance. Selected sizes are
            updated; other sizes stay intact.
          </p>
        </section>
      </div>
      <section className="admin-panel">
        <h2>3. Set starting prices & stock</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Price ₹</th>
                <th>MRP ₹</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size}>
                  <td>{size} ML</td>
                  {(["price", "mrp", "stock"] as const).map((k) => (
                    <td key={k}>
                      <input
                        type="number"
                        min="0"
                        aria-label={`${size} ML ${k}`}
                        value={prices[size]?.[k] || 0}
                        onChange={(e) => {
                          setPrices({
                            ...prices,
                            [size]: {
                              ...prices[size],
                              [k]: Number(e.target.value),
                            },
                          });
                          setJob(null);
                          setApproved(false);
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="button"
          disabled={busy || !rows.length || !sizes.length}
          onClick={() =>
            run(async () => {
              const data = await request<Job>("/api/admin/bulk", {
                action: "preview",
                rows,
                sizes,
                prices,
                publish,
              });
              setJob(data);
              setApproved(false);
              setMessage(
                "Preview created. Check the label placement before approving.",
              );
            })
          }
        >
          {busy ? "Preparing…" : "Preview bottle images"}
        </button>
      </section>
      {job && (
        <section className="admin-panel">
          <h2>4. Review & generate</h2>
          <p className="small muted">
            This preview is a saved snapshot of your names, pricing and
            templates. Changes above require a new preview.
          </p>
          <div className="bulk-previews">
            {[...new Set([0, Math.floor(job.total / 2), job.total - 1])].map(
              (i) => {
                const t = job.plan.templates[i % job.plan.templates.length];
                const row =
                  job.plan.rows[Math.floor(i / job.plan.templates.length)];
                return (
                  <figure key={i}>
                    <img
                      src={`/api/admin/bulk?id=${job.id}&proof=${i}`}
                      alt={`${row.name} ${t.size} ML preview`}
                    />
                    <figcaption>
                      {row.name} · {t.size} ML
                    </figcaption>
                  </figure>
                );
              },
            )}
          </div>
          {job.existing !== undefined && job.existing > 0 && (
            <p className="admin-notice">
              {job.existing} existing fragrances matched. This batch replaces
              images and pricing for their selected sizes.
            </p>
          )}
          {job.status === "preview" && (
            <>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                />
                I have checked these label previews and approve this batch.
              </label>
              <button
                disabled={!approved || busy}
                className="button"
                onClick={() =>
                  run(async () => {
                    await request("/api/admin/bulk", {
                      action: "generate",
                      id: job.id,
                    });
                    setJob({ ...job, status: "queued" });
                  })
                }
              >
                Generate all {job.total} variants
              </button>
            </>
          )}
          <div className="generation-progress">
            <span>
              {job.status} · {job.completed} / {job.total}
            </span>
            <progress max={job.total} value={job.completed} />
          </div>
          {job.status === "queued" && (
            <p className="small muted">
              Waiting for the image worker. You can leave this page; the saved
              job continues in the background.
            </p>
          )}
          {job.status === "failed" && (
            <>
              <p role="alert">{job.error}</p>
              <button
                className="button"
                onClick={() =>
                  run(async () => {
                    await request("/api/admin/bulk", {
                      action: "retry",
                      id: job.id,
                    });
                    setJob({ ...job, status: "queued" });
                  })
                }
              >
                Retry unfinished images
              </button>
            </>
          )}
          {job.status === "complete" && (
            <Link className="button" href="/admin/products">
              Review products
            </Link>
          )}
        </section>
      )}
      <section className="admin-panel">
        <h2>Batch history</h2>
        {jobs.length ? (
          jobs.map((j) => (
            <button
              className="job-row full"
              key={j.id}
              onClick={() => {
                setJob(j);
                setApproved(false);
              }}
            >
              <span>
                {new Date().getFullYear()} · {j.total} variants
              </span>
              <span>{j.completed} completed</span>
              <span className="status-chip">{j.status}</span>
            </button>
          ))
        ) : (
          <p className="muted small">No previous batches.</p>
        )}
      </section>
    </>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ProductRecord,
  VARIANT_SIZES as SIZES,
  sizeLabel,
} from "@/lib/types";
import { request, upload, Notice, Modal } from "./helpers";
import { Copy, DownloadSimple, Plus, NotePencil } from "../icons";
type Editable = Omit<
  ProductRecord,
  "id" | "slug" | "images" | "reviews" | "archived"
>;
function blank(): Editable {
  return {
    name: "",
    category: "Unisex",
    type: "Perfume",
    description: "",
    summary: "",
    notes: { top: "", heart: "", base: "" },
    occasion: "",
    longevity: "",
    badges: [],
    active: false,
    featured: false,
    variants: SIZES.map((size) => ({
      id: "",
      size,
      price: 0,
      mrp: 0,
      stock: 0,
      enabled: size === 100,
      image: "",
      imageSize: null,
    })),
  };
}
export function ProductsAdmin({ products }: { products: ProductRecord[] }) {
  const router = useRouter();
  const [query, setQuery] = useState(""),
    [message, setMessage] = useState(""),
    [editing, setEditing] = useState<{ id?: string; product: Editable } | null>(
      null,
    ),
    [busy, setBusy] = useState(false),
    [priceSize, setPriceSize] = useState(100),
    [amount, setAmount] = useState(0),
    [priceMode, setPriceMode] = useState("set"),
    [confirmPrices, setConfirmPrices] = useState(false);
  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      setMessage(success);
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  function exportCsv() {
    const headers = [
      "name",
      "category",
      "type",
      "size",
      "price",
      "mrp",
      "stock",
      "enabled",
      "image",
    ];
    const escape = (value: unknown) => {
      let v = String(value ?? "");
      if (/^[=+@-]/.test(v)) v = "'" + v;
      return '"' + v.replaceAll('"', '""') + '"';
    };
    const rows = products.flatMap((p) =>
      p.variants.map((v) =>
        [
          p.name,
          p.category,
          p.type,
          v.size,
          v.price,
          v.mrp,
          v.stock,
          v.enabled,
          v.image,
        ]
          .map(escape)
          .join(","),
      ),
    );
    const blob = new Blob(
      ["\uFEFF" + [headers.join(","), ...rows].join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vaidora-products.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  const set = (key: keyof Editable, value: unknown) =>
    setEditing((old) =>
      old ? { ...old, product: { ...old.product, [key]: value } } : old,
    );
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Products & inventory</h1>
          <p>
            {products.filter((p) => !p.archived).length} fragrances. Keep every
            size together.
          </p>
        </div>
        <div className="actions">
          <button className="button outline" onClick={exportCsv}>
            <DownloadSimple size={18} />
            Export CSV
          </button>
          <button
            className="button"
            onClick={() => setEditing({ product: blank() })}
          >
            <Plus size={18} />
            Add product
          </button>
        </div>
      </div>
      <Notice message={message} />
      <div className="admin-panel">
        <label className="search-admin">
          Search products
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or category"
          />
        </label>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fragrance</th>
                <th>Category</th>
                <th>Sizes</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((p) =>
                  `${p.name} ${p.category}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <small>{p.type}</small>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      {p.variants
                        .filter((v) => v.enabled)
                        .map((v) => sizeLabel(v.size))
                        .join(", ")}
                    </td>
                    <td>{p.variants.reduce((s, v) => s + v.stock, 0)}</td>
                    <td>
                      <span className="status-chip">
                        {p.archived
                          ? "Archived"
                          : p.active
                            ? "Published"
                            : "Draft"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit ${p.name}`}
                          onClick={() =>
                            setEditing({
                              id: p.id,
                              product: {
                                ...p,
                                variants: SIZES.map(
                                  (size) =>
                                    p.variants.find((v) => v.size === size) || {
                                      id: "",
                                      size,
                                      price: 0,
                                      mrp: 0,
                                      stock: 0,
                                      enabled: false,
                                      image: "",
                                      imageSize: null,
                                    },
                                ),
                              },
                            })
                          }
                        >
                          <NotePencil size={19} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Duplicate ${p.name}`}
                          disabled={busy}
                          onClick={() =>
                            run(
                              () =>
                                request("/api/admin/products", {
                                  action: "duplicate",
                                  id: p.id,
                                }),
                              "Draft copy created.",
                            )
                          }
                        >
                          <Copy size={19} />
                        </button>
                        <button
                          className="text-link"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () =>
                                request("/api/admin/products", {
                                  action: "archive",
                                  id: p.id,
                                  archived: !p.archived,
                                }),
                              p.archived
                                ? "Product restored."
                                : "Product archived. You can restore it here.",
                            )
                          }
                        >
                          {p.archived ? "Restore" : "Archive"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <section className="admin-panel">
        <h2>Bulk price rule</h2>
        <p className="muted small">
          Applies to every variant of the selected size. Prices are in rupees.
        </p>
        <div className="inline-form">
          <label>
            Bottle size
            <select
              value={priceSize}
              onChange={(e) => setPriceSize(Number(e.target.value))}
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {sizeLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rule
            <select
              value={priceMode}
              onChange={(e) => setPriceMode(e.target.value)}
            >
              <option value="set">Set price to</option>
              <option value="increase">Increase by</option>
            </select>
          </label>
          <label>
            Amount (₹)
            <input
              type="number"
              min="0"
              max="100000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>
          <button className="button" onClick={() => setConfirmPrices(true)}>
            Review change
          </button>
        </div>
      </section>
      {confirmPrices && (
        <Modal
          title="Confirm bulk pricing"
          onClose={() => setConfirmPrices(false)}
        >
          <p>
            {priceMode === "set" ? "Set the price of" : "Increase the price of"}{" "}
            all {sizeLabel(priceSize)} variants{" "}
            {priceMode === "set" ? "to" : "by"} ₹{amount}. This affects{" "}
            {products.reduce(
              (n, p) =>
                n + p.variants.filter((v) => v.size === priceSize).length,
              0,
            )}{" "}
            variants.
          </p>
          <div className="actions">
            <button
              className="button outline"
              onClick={() => setConfirmPrices(false)}
            >
              Cancel
            </button>
            <button
              className="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await request("/api/admin/products", {
                    action: "prices",
                    size: priceSize,
                    mode: priceMode,
                    amount,
                  });
                  setConfirmPrices(false);
                }, "Prices updated.")
              }
            >
              Apply price rule
            </button>
          </div>
        </Modal>
      )}
      {editing && (
        <Modal
          title={editing.id ? "Edit fragrance" : "New fragrance"}
          onClose={() => setEditing(null)}
        >
          <form
            className="admin-form"
            onSubmit={async (e) => {
              e.preventDefault();
              await run(async () => {
                await request("/api/admin/products", editing);
                setEditing(null);
              }, "Product saved.");
            }}
          >
            <div className="form-grid">
              <label>
                Name
                <input
                  required
                  maxLength={100}
                  value={editing.product.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </label>
              <label>
                Category
                <input
                  required
                  value={editing.product.category}
                  onChange={(e) => set("category", e.target.value)}
                />
              </label>
              <label>
                Type
                <select
                  value={editing.product.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  {["Perfume", "Attar", "Gift Set"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Badges, comma-separated
                <input
                  value={editing.product.badges.join(",")}
                  onChange={(e) =>
                    set("badges", e.target.value.split(",").filter(Boolean))
                  }
                />
              </label>
            </div>
            <label>
              Short summary
              <input
                value={editing.product.summary}
                onChange={(e) => set("summary", e.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                value={editing.product.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </label>
            <div className="form-grid three">
              {(["top", "heart", "base"] as const).map((key) => (
                <label key={key}>
                  {key} notes
                  <input
                    value={editing.product.notes[key]}
                    onChange={(e) =>
                      set("notes", {
                        ...editing.product.notes,
                        [key]: e.target.value,
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="form-grid">
              <label>
                Occasion
                <input
                  value={editing.product.occasion}
                  onChange={(e) => set("occasion", e.target.value)}
                />
              </label>
              <label>
                Longevity
                <input
                  value={editing.product.longevity}
                  onChange={(e) => set("longevity", e.target.value)}
                  placeholder="Only enter verified details"
                />
              </label>
            </div>
            <h3>Bottle sizes & pricing</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Enabled</th>
                    <th>Price ₹</th>
                    <th>MRP ₹</th>
                    <th>Stock</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>
                  {editing.product.variants.map((v, i) => (
                    <tr key={v.size}>
                      <td>
                        <label className="check-label">
                          <input
                            type="checkbox"
                            checked={v.enabled}
                            onChange={(e) =>
                              set(
                                "variants",
                                editing.product.variants.map((x, j) =>
                                  j === i
                                    ? { ...x, enabled: e.target.checked }
                                    : x,
                                ),
                              )
                            }
                          />
                          {sizeLabel(v.size)}
                        </label>
                      </td>
                      {(["price", "mrp", "stock"] as const).map((k) => (
                        <td key={k}>
                          <input
                            aria-label={`${sizeLabel(v.size)} ${k}`}
                            type="number"
                            min={0}
                            value={v[k]}
                            onChange={(e) =>
                              set(
                                "variants",
                                editing.product.variants.map((x, j) =>
                                  j === i
                                    ? { ...x, [k]: Number(e.target.value) }
                                    : x,
                                ),
                              )
                            }
                          />
                        </td>
                      ))}
                      <td>
                        <label className="small">
                          {v.image ? "Replace image" : "Upload image"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              await run(async () => {
                                const u = await upload(f);
                                set(
                                  "variants",
                                  editing.product.variants.map((x, j) =>
                                    j === i
                                      ? {
                                          ...x,
                                          image: u.url,
                                          imageSize: v.size,
                                        }
                                      : x,
                                  ),
                                );
                              }, "Image uploaded. Save the product to apply.");
                            }}
                          />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">
              Use the bulk generator to create named bottle images from your
              templates. A price of 0 displays “Ask for price”.
            </p>
            <div className="actions">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={editing.product.active}
                  onChange={(e) => set("active", e.target.checked)}
                />
                Published
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={editing.product.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                />
                Feature on homepage
              </label>
            </div>
            <Notice message={message} />
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save product"}
            </button>
          </form>
          {editing.id && (
            <div className="gallery-upload">
              <h3>Additional gallery photograph</h3>
              <label>
                Upload product photograph
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    await run(async () => {
                      const u = await upload(f);
                      await request("/api/admin/products", {
                        action: "gallery",
                        id: editing.id,
                        url: u.url,
                        alt: `${editing.product.name} additional photograph`,
                      });
                    }, "Gallery image added.");
                  }}
                />
              </label>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

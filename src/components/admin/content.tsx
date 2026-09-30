"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { type SiteSettings, slugify } from "@/lib/types";
import { request, upload, Notice } from "./helpers";
import { Plus, X } from "../icons";
type Category = {
  id?: string;
  name: string;
  slug: string;
  image: string;
  active: boolean;
  sort: number;
};
type Collection = {
  id?: string;
  name: string;
  slug: string;
  image: string;
  active: boolean;
  description: string;
  filter: { category?: string; badge?: string; featured?: boolean };
};
type Page = { slug: string; title: string; content: string };
type Review = {
  id?: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  approved: boolean;
};
export function ContentAdmin({
  settings,
  initialCategories,
  initialCollections,
  initialPages,
  initialReviews,
  products,
}: {
  settings: SiteSettings;
  initialCategories: Category[];
  initialCollections: Collection[];
  initialPages: Page[];
  initialReviews: Review[];
  products: { id: string; name: string }[];
}) {
  const [tab, setTab] = useState("Store settings"),
    [s, setS] = useState(settings),
    [categories, setCategories] = useState(initialCategories),
    [collections, setCollections] = useState(initialCollections),
    [pages, setPages] = useState(initialPages),
    [reviews, setReviews] = useState(initialReviews),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  const update = (key: keyof SiteSettings, value: unknown) =>
    setS((old) => ({ ...old, [key]: value }));
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      setMessage("Saved. Your storefront now uses the updated content.");
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const imageUpload = (callback: (url: string) => void) => (
    <label>
      Upload image
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f)
            run(async () => {
              const u = await upload(f);
              callback(u.url);
              setMessage("Image uploaded. Save this section to apply.");
            });
        }}
      />
    </label>
  );
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Make the store yours.</h1>
          <p>
            Content, categories, collections and the way customers reach you.
          </p>
        </div>
      </div>
      <div className="tabs content-tabs">
        {[
          "Store settings",
          "Homepage & banners",
          "Navigation",
          "Categories",
          "Collections",
          "Pages",
          "Reviews",
        ].map((x) => (
          <button
            className={tab === x ? "selected" : ""}
            key={x}
            onClick={() => {
              setTab(x);
              setMessage("");
            }}
          >
            {x}
          </button>
        ))}
      </div>
      <Notice message={message} />
      {["Store settings", "Homepage & banners", "Navigation"].includes(tab) && (
        <form
          className="admin-panel admin-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await request("/api/admin/settings", s);
            });
          }}
        >
          {tab === "Store settings" && (
            <>
              <h2>Contact & ordering</h2>
              <div className="form-grid">
                <label>
                  Brand name
                  <input
                    value={s.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    required
                  />
                </label>
                <label>
                  WhatsApp number (country code, digits only)
                  <input
                    value={s.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    pattern="[1-9][0-9]{9,14}"
                    required
                  />
                </label>
              </div>
              <label>
                Announcement bar
                <input
                  value={s.announcement}
                  onChange={(e) => update("announcement", e.target.value)}
                />
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={s.previewMode}
                  onChange={(e) => update("previewMode", e.target.checked)}
                />
                Show preview catalog disclosure
              </label>
              <h2>Bundle builder</h2>
              <div className="form-grid three">
                <label>
                  Fragrances per bundle
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={s.bundleCount}
                    onChange={(e) =>
                      update("bundleCount", Number(e.target.value))
                    }
                  />
                </label>
                <label>
                  Bottle size
                  <select
                    value={s.bundleSize}
                    onChange={(e) =>
                      update("bundleSize", Number(e.target.value))
                    }
                  >
                    {[6, 12, 20, 50, 100].map((x) => (
                      <option key={x} value={x}>
                        {x} ML
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Bundle price ₹ (0 = ask for price)
                  <input
                    type="number"
                    min={0}
                    value={s.bundlePrice}
                    onChange={(e) =>
                      update("bundlePrice", Number(e.target.value))
                    }
                  />
                </label>
              </div>
            </>
          )}
          {tab === "Homepage & banners" && (
            <>
              <h2>Hero banner</h2>
              <div className="form-grid">
                <label>
                  Headline (new line supported)
                  <textarea
                    value={s.heroTitle}
                    onChange={(e) => update("heroTitle", e.target.value)}
                    maxLength={100}
                  />
                </label>
                <label>
                  Supporting copy
                  <textarea
                    value={s.heroCopy}
                    onChange={(e) => update("heroCopy", e.target.value)}
                    maxLength={250}
                  />
                </label>
                <label>
                  Button label
                  <input
                    value={s.heroButton}
                    onChange={(e) => update("heroButton", e.target.value)}
                  />
                </label>
                <label>
                  Button link
                  <input
                    value={s.heroLink}
                    onChange={(e) => update("heroLink", e.target.value)}
                  />
                </label>
                <label>
                  Hero image path
                  <input
                    value={s.heroImage}
                    onChange={(e) => update("heroImage", e.target.value)}
                  />
                </label>
                {imageUpload((url) => update("heroImage", url))}
              </div>
              <h2>Homepage product sections</h2>
              {s.sections.map((v, i) => (
                <div className="editor-row" key={i}>
                  <label>
                    Section title
                    <input
                      value={v.title}
                      onChange={(e) =>
                        update(
                          "sections",
                          s.sections.map((x, j) =>
                            i === j ? { ...x, title: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Filter (featured, all, type, category or badge)
                    <input
                      value={v.filter}
                      onChange={(e) =>
                        update(
                          "sections",
                          s.sections.map((x, j) =>
                            i === j ? { ...x, filter: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={v.enabled}
                      onChange={(e) =>
                        update(
                          "sections",
                          s.sections.map((x, j) =>
                            i === j ? { ...x, enabled: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove section ${i + 1}`}
                    onClick={() =>
                      update(
                        "sections",
                        s.sections.filter((_, j) => j !== i),
                      )
                    }
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button outline"
                onClick={() =>
                  update("sections", [
                    ...s.sections,
                    { title: "New collection", filter: "all", enabled: true },
                  ])
                }
              >
                <Plus size={18} />
                Add section
              </button>
              <h2>Promotional banners</h2>
              {s.banners.map((b, i) => (
                <div className="sub-panel" key={i}>
                  <div className="form-grid">
                    {(["title", "copy", "image", "href"] as const).map((k) => (
                      <label key={k}>
                        {k}
                        <input
                          value={b[k]}
                          onChange={(e) =>
                            update(
                              "banners",
                              s.banners.map((x, j) =>
                                i === j ? { ...x, [k]: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </label>
                    ))}
                    {imageUpload((url) =>
                      update(
                        "banners",
                        s.banners.map((x, j) =>
                          i === j ? { ...x, image: url } : x,
                        ),
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      update(
                        "banners",
                        s.banners.filter((_, j) => i !== j),
                      )
                    }
                  >
                    Remove banner
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button outline"
                onClick={() =>
                  update("banners", [
                    ...s.banners,
                    {
                      title: "New collection",
                      copy: "",
                      image: "/masters/100ml.png",
                      href: "/collections",
                    },
                  ])
                }
              >
                Add banner
              </button>
            </>
          )}
          {tab === "Navigation" && (
            <>
              <h2>Main navigation</h2>
              <p className="small muted">
                Shown in both desktop and mobile navigation. Use links inside
                the site, for example /collections/women.
              </p>
              {s.navigation.map((v, i) => (
                <div className="editor-row" key={i}>
                  <label>
                    Label
                    <input
                      value={v.label}
                      onChange={(e) =>
                        update(
                          "navigation",
                          s.navigation.map((x, j) =>
                            i === j ? { ...x, label: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    Link
                    <input
                      value={v.href}
                      onChange={(e) =>
                        update(
                          "navigation",
                          s.navigation.map((x, j) =>
                            i === j ? { ...x, href: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove navigation item ${i + 1}`}
                    onClick={() =>
                      update(
                        "navigation",
                        s.navigation.filter((_, j) => i !== j),
                      )
                    }
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button outline"
                onClick={() =>
                  update("navigation", [
                    ...s.navigation,
                    { label: "Collection", href: "/collections" },
                  ])
                }
              >
                Add navigation item
              </button>
            </>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Saving…" : "Save store changes"}
          </button>
        </form>
      )}
      {tab === "Categories" && (
        <>
          <div className="admin-panel">
            <h2>Categories</h2>
            <p className="small muted">
              The category name matches each product’s category. Perfumes,
              Attars and Gift Sets filter by product type.
            </p>
            <button
              className="button outline"
              onClick={() =>
                setCategories([
                  ...categories,
                  {
                    name: "New category",
                    slug: `new-category-${categories.length}`,
                    image: "",
                    active: false,
                    sort: categories.length,
                  },
                ])
              }
            >
              Add category
            </button>
          </div>
          {categories.map((cat, i) => (
            <form
              className="admin-panel admin-form"
              key={i}
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  const result = await request<Category>(
                    "/api/admin/categories",
                    cat,
                  );
                  setCategories((old) =>
                    old.map((x, j) => (i === j ? result : x)),
                  );
                });
              }}
            >
              <div className="form-grid">
                <label>
                  Name
                  <input
                    value={cat.name}
                    onChange={(e) =>
                      setCategories((old) =>
                        old.map((x, j) =>
                          i === j ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  URL slug
                  <input
                    value={cat.slug}
                    onChange={(e) =>
                      setCategories((old) =>
                        old.map((x, j) =>
                          i === j ? { ...x, slug: slugify(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Sort order
                  <input
                    type="number"
                    min={0}
                    value={cat.sort}
                    onChange={(e) =>
                      setCategories((old) =>
                        old.map((x, j) =>
                          i === j ? { ...x, sort: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                </label>
                {imageUpload((url) =>
                  setCategories((old) =>
                    old.map((x, j) => (i === j ? { ...x, image: url } : x)),
                  ),
                )}
              </div>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={cat.active}
                  onChange={(e) =>
                    setCategories((old) =>
                      old.map((x, j) =>
                        i === j ? { ...x, active: e.target.checked } : x,
                      ),
                    )
                  }
                />
                Visible
              </label>
              <button className="button" disabled={busy}>
                Save category
              </button>
            </form>
          ))}
        </>
      )}
      {tab === "Collections" && (
        <>
          <div className="admin-panel">
            <h2>Curated collections</h2>
            <button
              className="button outline"
              onClick={() =>
                setCollections([
                  ...collections,
                  {
                    name: "New collection",
                    slug: `new-collection-${collections.length}`,
                    image: "",
                    active: false,
                    description: "",
                    filter: {},
                  },
                ])
              }
            >
              Add collection
            </button>
          </div>
          {collections.map((col, i) => {
            const change = (key: keyof Collection, value: unknown) =>
              setCollections((old) =>
                old.map((x, j) => (i === j ? { ...x, [key]: value } : x)),
              );
            return (
              <form
                className="admin-panel admin-form"
                key={i}
                onSubmit={(e) => {
                  e.preventDefault();
                  run(async () => {
                    const result = await request<Collection>(
                      "/api/admin/collections",
                      col,
                    );
                    setCollections((old) =>
                      old.map((x, j) => (i === j ? result : x)),
                    );
                  });
                }}
              >
                <div className="form-grid">
                  <label>
                    Name
                    <input
                      value={col.name}
                      onChange={(e) => change("name", e.target.value)}
                    />
                  </label>
                  <label>
                    URL slug
                    <input
                      value={col.slug}
                      onChange={(e) => change("slug", slugify(e.target.value))}
                    />
                  </label>
                  <label>
                    Match category (optional)
                    <input
                      value={col.filter.category || ""}
                      onChange={(e) =>
                        change("filter", {
                          ...col.filter,
                          category: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Match badge (optional)
                    <input
                      value={col.filter.badge || ""}
                      onChange={(e) =>
                        change("filter", {
                          ...col.filter,
                          badge: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <label>
                  Description
                  <textarea
                    value={col.description}
                    onChange={(e) => change("description", e.target.value)}
                  />
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={!!col.filter.featured}
                    onChange={(e) =>
                      change("filter", {
                        ...col.filter,
                        featured: e.target.checked,
                      })
                    }
                  />
                  Only featured products
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={col.active}
                    onChange={(e) => change("active", e.target.checked)}
                  />
                  Visible
                </label>
                <button className="button" disabled={busy}>
                  Save collection
                </button>
              </form>
            );
          })}
        </>
      )}
      {tab === "Pages" &&
        pages.map((page, i) => (
          <form
            className="admin-panel admin-form"
            key={page.slug}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await request("/api/admin/pages", page);
              });
            }}
          >
            <h2>{page.slug}</h2>
            <label>
              Page title
              <input
                value={page.title}
                onChange={(e) =>
                  setPages((old) =>
                    old.map((x, j) =>
                      j === i ? { ...x, title: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label>
              Content
              <textarea
                rows={6}
                value={page.content}
                onChange={(e) =>
                  setPages((old) =>
                    old.map((x, j) =>
                      j === i ? { ...x, content: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            {page.slug === "faq" && (
              <p className="small muted">
                One question per line, separated from its answer by |.
              </p>
            )}
            <button className="button" disabled={busy}>
              Save page
            </button>
          </form>
        ))}
      {tab === "Reviews" && (
        <>
          <div className="admin-panel">
            <h2>Customer reviews</h2>
            <p className="muted small">
              Only add real customer feedback shared with permission. Approved
              reviews appear on product pages.
            </p>
            <button
              className="button outline"
              onClick={() =>
                setReviews([
                  ...reviews,
                  {
                    productId: products[0]?.id || "",
                    author: "",
                    rating: 5,
                    text: "",
                    approved: false,
                  },
                ])
              }
            >
              Add received review
            </button>
          </div>
          {reviews.map((review, i) => {
            const change = (key: keyof Review, value: unknown) =>
              setReviews((old) =>
                old.map((x, j) => (i === j ? { ...x, [key]: value } : x)),
              );
            return (
              <form
                className="admin-panel admin-form"
                key={i}
                onSubmit={(e) => {
                  e.preventDefault();
                  run(async () => {
                    const result = await request<Review>(
                      "/api/admin/reviews",
                      review,
                    );
                    setReviews((old) =>
                      old.map((x, j) => (i === j ? result : x)),
                    );
                  });
                }}
              >
                <div className="form-grid">
                  <label>
                    Product
                    <select
                      value={review.productId}
                      onChange={(e) => change("productId", e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Customer name
                    <input
                      value={review.author}
                      required
                      onChange={(e) => change("author", e.target.value)}
                    />
                  </label>
                  <label>
                    Rating
                    <select
                      value={review.rating}
                      onChange={(e) => change("rating", Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} / 5
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Feedback
                  <textarea
                    value={review.text}
                    required
                    onChange={(e) => change("text", e.target.value)}
                  />
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={review.approved}
                    onChange={(e) => change("approved", e.target.checked)}
                  />
                  Approved for display
                </label>
                <button className="button" disabled={busy}>
                  Save review
                </button>
              </form>
            );
          })}
        </>
      )}
    </>
  );
}

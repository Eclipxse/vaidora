"use client";
import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "./product-card";
import { type ProductRecord, sizeLabel } from "@/lib/types";
import { useFavorites } from "./favorites";
import { MagnifyingGlass, X, ArrowUpRight } from "./icons";
export function CatalogGrid({
  products,
  initialQuery = "",
  initialCategory = "All",
  initialSize = "",
  savedOnly = false,
}: {
  products: ProductRecord[];
  initialQuery?: string;
  initialCategory?: string;
  initialSize?: string;
  savedOnly?: boolean;
}) {
  const [limit, setLimit] = useState(24);
  const [query, setQuery] = useState(initialQuery),
    [category, setCategory] = useState(initialCategory),
    [size, setSize] = useState(initialSize),
    [sort, setSort] = useState("featured");
  const { saved } = useFavorites();
  const emptySaved = savedOnly && saved.length === 0;
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filtered = products.filter(
    (p) =>
      (!savedOnly || saved.includes(p.id)) &&
      (category === "All" || p.category === category) &&
      (!size || p.variants.some((v) => v.enabled && v.size === Number(size))) &&
      `${p.name} ${p.type} ${p.category} ${p.variants.map((v) => sizeLabel(v.size)).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "price")
    filtered.sort(
      (a, b) =>
        Math.min(...a.variants.filter((v) => v.enabled).map((v) => v.price)) -
        Math.min(...b.variants.filter((v) => v.enabled).map((v) => v.price)),
    );
  return (
    <>
      <div className="catalog-tools">
        <div className="search-field">
          <MagnifyingGlass size={20} />
          <input
            aria-label="Search fragrances"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(24);
            }}
            placeholder="Search this collection"
          />
          {query && (
            <button
              type="button"
              className="icon-button"
              onClick={() => {
                setQuery("");
                setLimit(24);
              }}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <label>
          Size
          <select
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              setLimit(24);
            }}
          >
            <option value="">All sizes</option>
            {[6, 12, 20, 50, 100, 0].map((s) => (
              <option key={s} value={s}>
                {sizeLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="az">Name A–Z</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </div>
      <div className="catalog-sub">
        <div className="tabs" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => {
                setCategory(c);
                setLimit(24);
              }}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="muted small" aria-live="polite">
          {filtered.length} fragrances
        </span>
      </div>
      {filtered.length ? (
        <div className="product-grid">
          {filtered.slice(0, limit).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              preferredSize={size === "" ? 100 : Number(size)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {emptySaved
              ? "Your favourites belong here."
              : "No fragrances found."}
          </h2>
          <p>
            {emptySaved
              ? "Tap the heart on any fragrance to save it for later."
              : "Try another search or clear your filters."}
          </p>
          {emptySaved ? (
            <Link href="/collections" className="button">
              Explore the collection <ArrowUpRight size={18} />
            </Link>
          ) : (
            <button
              className="button outline"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setSize("");
                setLimit(24);
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      )}
      {filtered.length > limit && (
        <div className="load-more">
          <p className="small muted">
            Showing {limit} of {filtered.length} fragrances
          </p>
          <button
            className="button outline"
            onClick={() => setLimit(limit + 24)}
          >
            Show more fragrances
          </button>
        </div>
      )}
    </>
  );
}

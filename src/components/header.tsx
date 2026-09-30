"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  CaretRight,
  Heart,
  House,
  Stack,
  Ruler,
  Drop,
  List,
  MagnifyingGlass,
  WhatsappLogo,
  X,
} from "./icons";
import { useFavorites } from "./favorites";
import { BrandLogo } from "./brand-logo";
import {
  money,
  whatsappUrl,
  sizeLabel,
  assetUrl,
  type ProductRecord,
  type SiteSettings,
} from "@/lib/types";

export function Header({
  settings,
  products,
}: {
  settings: SiteSettings;
  products: ProductRecord[];
}) {
  const search = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const path = usePathname();
  const { saved } = useFavorites();
  const results = products
    .filter((p) =>
      `${p.name} ${p.category} ${p.variants.map((v) => sizeLabel(v.size)).join(" ")}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
    )
    .slice(0, 5);
  const chat = whatsappUrl(
    settings.whatsapp,
    "Hi Vaidora! Could you help me choose a fragrance?",
  );
  const formatPrice = (size: number) => {
    const prices = products.flatMap((product) =>
      product.variants
        .filter((variant) => variant.enabled && variant.size === size)
        .map((variant) => variant.price),
    );
    return prices.length ? money(Math.min(...prices)) : "Ask For Price";
  };
  const navLinks = [
    { label: "All fragrances", href: "/collections" },
    { label: "Women", href: "/collections/women" },
    { label: "Men", href: "/collections/men" },
    { label: "Unisex", href: "/collections/unisex" },
    { label: "Build your collection", href: "/bundle" },
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement-wrap">
        <span>Luxury Fragrances · Fixed Catalog Prices</span>
        <a href={chat} target="_blank" rel="noopener noreferrer">
          Order On WhatsApp <ArrowUpRight size={13} />
        </a>
      </div>
      <header className="site-header">
        <div className="header-main container">
          <button
            className="icon-button menu-trigger"
            onClick={(event) => {
              if (!menu.current) return;
              menu.current.dataset.keyboard = String(event.detail === 0);
              menu.current.showModal();
            }}
            aria-label="Open navigation"
          >
            <List size={23} />
          </button>
          <BrandLogo priority />
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Search fragrances"
              onClick={(event) => {
                if (!search.current) return;
                search.current.dataset.keyboard = String(event.detail === 0);
                search.current.showModal();
              }}
            >
              <MagnifyingGlass size={21} />
            </button>
            <Link
              href="/wishlist"
              className="icon-button favorites-trigger"
              aria-label={`Saved fragrances${saved.length ? `, ${saved.length} saved` : ""}`}
            >
              <Heart size={21} weight={saved.length ? "fill" : "regular"} />
              {saved.length > 0 && (
                <span className="action-counter">{saved.length}</span>
              )}
            </Link>
            <a
              className="header-chat-link"
              href={chat}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappLogo size={23} />
              <span className="sr-only">Ask Vaidora on WhatsApp</span>
            </a>
          </div>
        </div>
        <div className="mobile-offer-links">
          <Link href="/collections?size=12">
            12 ML Perfumes At {formatPrice(12)}
          </Link>
          <Link href="/collections?size=100">
            100 ML Perfumes At {formatPrice(100)}
          </Link>
        </div>
      </header>

      <dialog
        ref={search}
        className="search-dialog"
        aria-label="Search fragrances"
        onClick={(e) => {
          if (e.target === e.currentTarget) search.current?.close();
        }}
      >
        <div className="dialog-head">
          <h2>Find your fragrance.</h2>
          <button
            className="icon-button"
            aria-label="Close search"
            onClick={() => search.current?.close()}
          >
            <X size={23} />
          </button>
        </div>
        <form action="/search" onSubmit={() => search.current?.close()}>
          <div className="search-field">
            <MagnifyingGlass size={21} />
            <input
              aria-label="Search by fragrance name, category or size"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try Good Girl, Oud Wood, 12 ML…"
              autoComplete="off"
            />
            <button className="text-link" type="submit">
              Search
            </button>
          </div>
        </form>
        <p className="small muted" aria-live="polite">
          {q
            ? `${results.length ? "Matching" : "No matching"} fragrances`
            : "A few places to start"}
        </p>
        <div className="search-results">
          {results.map((p) => {
            const v =
              p.variants.find((v) => v.enabled && v.size === 100) ||
              p.variants.find((v) => v.enabled);
            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                onClick={() => search.current?.close()}
              >
                {v?.image && (
                  <Image
                    src={assetUrl(v.image)}
                    alt=""
                    width={50}
                    height={64}
                  />
                )}
                <div className="search-item-info">
                  <strong>{p.name}</strong>
                  <small>
                    {p.category}
                    {v ? ` / ${sizeLabel(v.size)}` : ""}
                  </small>
                </div>
                <span>{money(v?.price || 0)}</span>
                <CaretRight size={16} />
              </Link>
            );
          })}
          {!results.length && (
            <p className="search-empty">
              Try another fragrance name, category or bottle size.
            </p>
          )}
        </div>
        <Link
          className="button outline full"
          href={`/search?q=${encodeURIComponent(q)}`}
          onClick={() => search.current?.close()}
        >
          View all results <ArrowUpRight size={18} />
        </Link>
      </dialog>

      <dialog
        ref={menu}
        className="menu-dialog"
        aria-label="Vaidora navigation"
        onClick={(e) => {
          if (e.target === e.currentTarget) menu.current?.close();
        }}
      >
        <div className="dialog-head">
          <span>Explore Vaidora</span>
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => menu.current?.close()}
          >
            <X size={23} />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={path === link.href ? "page" : undefined}
              onClick={() => menu.current?.close()}
            >
              {link.label}
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </nav>
        <div className="menu-secondary">
          <Link href="/wishlist" onClick={() => menu.current?.close()}>
            Saved fragrances ({saved.length})
          </Link>
          <Link href="/contact" onClick={() => menu.current?.close()}>
            Contact & assistance
          </Link>
          <Link href="/faq" onClick={() => menu.current?.close()}>
            Frequently asked questions
          </Link>
        </div>
        <a
          className="button full"
          href={chat}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsappLogo size={21} /> Ask us on WhatsApp
        </a>
      </dialog>
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        <Link href="/" aria-current={path === "/" ? "page" : undefined}>
          <House size={22} />
          <span>Home</span>
        </Link>
        <Link href="/collections?size=12">
          <Ruler size={22} />
          <span>Pocket</span>
        </Link>
        <Link
          href="/collections"
          aria-current={path === "/collections" ? "page" : undefined}
        >
          <Drop size={22} />
          <span>Collection</span>
        </Link>
        <Link
          href="/bundle"
          aria-current={path === "/bundle" ? "page" : undefined}
        >
          <Stack size={22} />
          <span>Bundle</span>
        </Link>
        <Link
          href="/wishlist"
          aria-current={path === "/wishlist" ? "page" : undefined}
        >
          <Heart size={22} />
          <span>Saved</span>
        </Link>
      </nav>
      <a
        className="floating-chat"
        href={chat}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Vaidora on WhatsApp"
      >
        <WhatsappLogo size={29} />
      </a>
    </>
  );
}

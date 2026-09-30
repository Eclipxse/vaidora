"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  WhatsappLogo,
  Heart,
  Minus,
  Plus,
  ChatCircleText,
  Gift,
} from "./icons";
import {
  money,
  whatsappUrl,
  productMessage,
  sizeLabel,
  assetUrl,
  type ProductRecord,
} from "@/lib/types";
import { useFavorites } from "./favorites";
import { ProductCard } from "./product-card";
export function ProductDetail({
  product: p,
  phone,
  initialSize,
  products,
}: {
  product: ProductRecord;
  phone: string;
  initialSize?: number;
  products: ProductRecord[];
}) {
  const variants = p.variants.filter((v) => v.enabled);
  const reduced = useReducedMotion();
  const selectionId = useId();
  const [keyboard, setKeyboard] = useState(false);
  const [size, setSize] = useState(
    () =>
      variants.find((variant) => variant.size === initialSize)?.size ??
      variants.find((variant) => variant.size === 100)?.size ??
      variants[0]?.size,
  );
  const v = variants.find((v) => v.size === size) || variants[0];
  const [qty, setQty] = useState(1),
    [image, setImage] = useState(v?.image || "/masters/100ml.png"),
    [origin, setOrigin] = useState(""),
    [recent, setRecent] = useState<string[]>([]);
  const { saved, toggle } = useFavorites();
  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      const old = JSON.parse(localStorage.getItem("vaidora-recent") || "[]");
      if (Array.isArray(old)) {
        setRecent(old.filter((x: string) => x !== p.id).slice(0, 4));
        localStorage.setItem(
          "vaidora-recent",
          JSON.stringify(
            [p.id, ...old.filter((x: string) => x !== p.id)].slice(0, 8),
          ),
        );
      }
    } catch {}
  }, [p.id]);
  if (!v)
    return (
      <div className="empty-state">
        <h1>{p.name}</h1>
        <p>This fragrance has no available sizes yet.</p>
        <Link href="/collections">Explore other fragrances</Link>
      </div>
    );
  const gallery = [
    ...new Set([v.image, ...p.images.map((x) => x.url)].filter(Boolean)),
  ];
  const buy = whatsappUrl(phone, productMessage(p, v, qty, origin));
  return (
    <div className="container product-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/collections">Fragrances</Link>{" "}
        / {p.name}
      </nav>
      <section className="product-detail">
        <div className="gallery">
          <div className="main-product-image">
            <Image
              src={assetUrl(image)}
              alt={`${p.name} by Vaidora, ${sizeLabel(v.imageSize ?? v.size)} bottle`}
              fill
              preload
              sizes="(max-width:768px) 100vw, 50vw"
            />
            <button
              className="save-button"
              onClick={() => toggle(p.id)}
              aria-label={
                saved.includes(p.id)
                  ? "Remove from saved fragrances"
                  : "Save fragrance"
              }
              aria-pressed={saved.includes(p.id)}
            >
              <Heart
                size={24}
                weight={saved.includes(p.id) ? "fill" : "regular"}
              />
            </button>
          </div>
          <div className="thumbnails">
            {gallery.map((url, i) => (
              <button
                className={image === url ? "active" : ""}
                key={url}
                aria-label={`View image ${i + 1}`}
                onClick={() => setImage(url)}
              >
                <Image src={assetUrl(url)} alt="" width={70} height={84} />
              </button>
            ))}
          </div>
          {v.imageSize && v.imageSize !== v.size && (
            <p className="small muted">
              Bottle shown: {v.imageSize} ML. Selected option:{" "}
              {sizeLabel(v.size)}. Exact option photography will be added when
              available.
            </p>
          )}
        </div>
        <div className="detail-copy">
          <h1>{p.name}</h1>
          <div className="detail-category">
            <span>{p.category}</span>
            <span>{p.type}</span>
          </div>
          <p className="detail-summary">{p.summary}</p>
          {p.reviews.length > 0 && (
            <a href="#reviews" className="text-link">
              {(
                p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
              ).toFixed(1)}{" "}
              / 5 · {p.reviews.length} reviews
            </a>
          )}
          <div className="detail-price">
            <strong>{money(v.price)}</strong>
            {v.mrp > v.price && v.price > 0 && (
              <>
                <del>{money(v.mrp)}</del>
                <span className="discount">
                  Save {Math.round((1 - v.price / v.mrp) * 100)}%
                </span>
              </>
            )}
          </div>
          <p className="small muted">
            Price, stock and delivery confirmed personally on WhatsApp.
          </p>
          <fieldset className="size-selector">
            <legend>
              Choose your size <span>{sizeLabel(v.size)}</span>
            </legend>
            <div>
              {variants.map((item) => (
                <button
                  key={item.id}
                  className={v.id === item.id ? "selected" : ""}
                  onClick={(event) => {
                    setKeyboard(event.detail === 0);
                    setSize(item.size);
                    setImage(item.image || "/masters/100ml.png");
                    const url = new URL(window.location.href);
                    url.searchParams.set("size", String(item.size));
                    window.history.replaceState(null, "", url);
                  }}
                  aria-pressed={v.id === item.id}
                >
                  {v.id === item.id && (
                    <motion.span
                      className="size-selection-fill"
                      layoutId={`${selectionId}-size`}
                      transition={{
                        type: "spring",
                        bounce: 0,
                        duration: reduced || keyboard ? 0 : 0.24,
                      }}
                    />
                  )}
                  <span>{sizeLabel(item.size)}</span>
                  <small>{money(item.price)}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="buy-row">
            <div className="quantity" aria-label="Quantity">
              <button
                disabled={qty <= 1}
                onClick={() => setQty(qty - 1)}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <output aria-live="polite">{qty}</output>
              <button
                disabled={qty >= 99}
                onClick={() => setQty(qty + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <a
              className="button whatsapp-button"
              href={buy}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappLogo size={24} />
              Buy on WhatsApp
              <ArrowUpRight size={18} />
            </a>
          </div>
          <p className="buy-note">
            Your selection opens in WhatsApp. Send the message to place your
            enquiry.
          </p>
          <div className="detail-perks">
            <span>
              <ChatCircleText size={21} />
              Personal recommendations
            </span>
            <span>
              <Gift size={21} />
              Ask about gifting
            </span>
          </div>
          <details open>
            <summary>About this fragrance</summary>
            <p>{p.description}</p>
          </details>
          <details>
            <summary>Fragrance details</summary>
            <dl>
              <dt>Fragrance type</dt>
              <dd>{p.type}</dd>
              <dt>Collection</dt>
              <dd>{p.category}</dd>
              <dt>Occasion</dt>
              <dd>{p.occasion || "Ask us for a recommendation"}</dd>
              <dt>Longevity</dt>
              <dd>
                {p.longevity || "Contact us for fragrance-specific details"}
              </dd>
            </dl>
          </details>
          <details>
            <summary>Delivery & ordering</summary>
            <p>
              Send your city and PIN code with your enquiry. We’ll confirm
              availability, delivery charges and payment options before you
              order.
            </p>
          </details>
        </div>
      </section>
      <section className="notes-section">
        <div>
          <h2>
            The finer
            <br />
            details.
          </h2>
        </div>
        {Object.entries(p.notes)
          .filter(([, value]) => Boolean(value))
          .map(([key, value]) => (
            <div className="note" key={key}>
              <h3>
                {key === "top"
                  ? "The opening"
                  : key === "heart"
                    ? "The heart"
                    : "The lasting impression"}
              </h3>
              <p>{value || "Ask us about these notes"}</p>
            </div>
          ))}
        {!Object.values(p.notes).some(Boolean) && (
          <div className="notes-inquiry">
            <p>
              Ask us about the opening, heart and base notes of {p.name}. We’ll
              help you decide if it’s your kind of fragrance.
            </p>
            <a
              className="text-link"
              href={whatsappUrl(
                phone,
                `Hi Vaidora! Could you tell me more about the notes of ${p.name}?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask about this fragrance <ArrowUpRight size={18} />
            </a>
          </div>
        )}
      </section>
      {p.reviews.length > 0 ? (
        <section id="reviews" className="reviews-section">
          <h2>Fragrance conversations</h2>
          {p.reviews.map((r) => (
            <blockquote key={r.id}>
              <strong>
                {r.author} · {r.rating}/5
              </strong>
              <p>{r.text}</p>
            </blockquote>
          ))}
        </section>
      ) : (
        <div className="review-invitation">
          <p>Tried {p.name}?</p>
          <a
            className="text-link"
            href={whatsappUrl(
              phone,
              `Hi Vaidora! I'd like to share my experience with ${p.name}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share your experience <ArrowUpRight size={18} />
          </a>
        </div>
      )}
      <section className="product-section">
        <div className="section-heading">
          <h2>You might also love.</h2>
          <Link className="text-link" href="/collections">
            Explore all
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
        </div>
      </section>
      {recent.length > 0 && (
        <section className="product-section">
          <h2>Recently explored</h2>
          <div className="product-grid">
            {products
              .filter((x) => recent.includes(x.id))
              .map((x) => (
                <ProductCard key={x.id} product={x} />
              ))}
          </div>
        </section>
      )}
      <div className="sticky-buy">
        <span>
          {p.name}
          <small>
            {sizeLabel(v.size)} · {money(v.price)}
          </small>
        </span>
        <a
          className="button whatsapp-button"
          href={buy}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsappLogo size={21} />
          Buy on WhatsApp
        </a>
      </div>
    </div>
  );
}

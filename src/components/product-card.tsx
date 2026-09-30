"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowUpRight } from "./icons";
import { useFavorites } from "./favorites";
import { money, assetUrl, sizeLabel, type ProductRecord } from "@/lib/types";

export function ProductCard({
  product: p,
  preferredSize = 100,
}: {
  product: ProductRecord;
  preferredSize?: number;
}) {
  const { saved, toggle } = useFavorites();
  const variants = p.variants.filter((v) => v.enabled);
  const variant = variants.find((v) => v.size === preferredSize) || variants[0];
  if (!variant) return null;
  const liked = saved.includes(p.id);
  const href = `/products/${p.slug}?size=${variant.size}`;
  const representative =
    variant.imageSize != null && variant.imageSize !== variant.size;

  return (
    <article className="product-card" data-product-id={p.id}>
      <div className="product-photo-wrap">
        <Link
          href={href}
          aria-label={`View ${p.name}`}
          className="photo-anchor"
        >
          <Image
            src={assetUrl(
              variant.image || p.images[0]?.url || "/masters/100ml.png",
            )}
            alt={`${p.name} by Vaidora, ${sizeLabel(variant.imageSize ?? variant.size)} bottle`}
            fill
            sizes="(max-width: 600px) 45vw, (max-width: 1024px) 30vw, 23vw"
            className="product-main-img"
          />
        </Link>
        <span className="product-size-badge">{sizeLabel(variant.size)}</span>
        <button
          type="button"
          aria-label={`${liked ? "Remove" : "Save"} ${p.name}`}
          aria-pressed={liked}
          className="product-fav-btn"
          onClick={() => toggle(p.id)}
        >
          <Heart size={19} weight={liked ? "fill" : "regular"} />
        </button>
      </div>
      <div className="product-card-body">
        <div className="product-meta">
          <span>{p.category}</span>
          <span>{sizeLabel(variant.size)}</span>
        </div>
        <h3>
          <Link className="product-title" href={href}>
            {p.name}
          </Link>
        </h3>
        <div className="product-card-bottom">
          <strong>{money(variant.price)}</strong>
        </div>
        {representative && (
          <p className="representative-note">Representative bottle shown</p>
        )}
        <Link
          href={href}
          className="product-discover"
          aria-label={`Choose options for ${p.name}`}
        >
          <span>Choose options</span>
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}

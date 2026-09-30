"use client";
import { useState } from "react";
import Image from "next/image";
import {
  type ProductRecord,
  type SiteSettings,
  whatsappUrl,
  money,
  assetUrl,
} from "@/lib/types";
import { WhatsappLogo, Check } from "./icons";
export function BundleBuilder({
  products,
  settings: s,
}: {
  products: ProductRecord[];
  settings: SiteSettings;
}) {
  const [chosen, setChosen] = useState<string[]>(Array(s.bundleCount).fill(""));
  const eligible = products.filter((p) =>
    p.variants.some((v) => v.enabled && v.size === s.bundleSize),
  );
  const complete = chosen.every(Boolean);
  const message = `Hi Vaidora! I’d like this fragrance bundle:\n\n${chosen.map((id, i) => `${i + 1}. ${products.find((p) => p.id === id)?.name || "Not selected"} — ${s.bundleSize} ML`).join("\n")}${s.bundlePrice ? `\n\nListed bundle price: ${money(s.bundlePrice)}` : ""}\n\nPlease confirm availability, gift packaging and the total including delivery.`;
  return (
    <div className="bundle-layout">
      <div className="bundle-slots">
        {chosen.map((id, i) => {
          const p = products.find((p) => p.id === id);
          const v = p?.variants.find((v) => v.size === s.bundleSize);
          return (
            <div className="bundle-slot" key={i}>
              <div className="slot-top">
                <span>{String(i + 1).padStart(2, "0")}</span>
                {id && <Check size={23} />}
              </div>
              <div className="slot-image">
                {v?.image ? (
                  <Image
                    src={assetUrl(v.image)}
                    alt={p!.name}
                    fill
                    sizes="(max-width:640px) 80vw, 25vw"
                  />
                ) : (
                  <span className="slot-placeholder">
                    Make
                    <br />
                    it yours.
                  </span>
                )}
              </div>
              <label htmlFor={`fragrance-${i}`}>Choose fragrance {i + 1}</label>
              <select
                id={`fragrance-${i}`}
                value={id}
                onChange={(e) =>
                  setChosen((old) =>
                    old.map((v, j) => (j === i ? e.target.value : v)),
                  )
                }
              >
                <option value="">Select a fragrance</option>
                {eligible.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="small muted">{s.bundleSize} ML bottle</p>
            </div>
          );
        })}
      </div>
      <div className="bundle-summary">
        <div>
          <h2>Your personal collection.</h2>
          <p aria-live="polite">
            {chosen.filter(Boolean).length} of {s.bundleCount} selected ·{" "}
            {s.bundleSize} ML each
          </p>
          <progress
            className="bundle-progress"
            value={chosen.filter(Boolean).length}
            max={s.bundleCount}
            aria-label="Fragrances selected"
          />
        </div>
        <strong>
          {s.bundlePrice ? money(s.bundlePrice) : "Ask for your bundle price"}
        </strong>
        {complete ? (
          <a
            className="button whatsapp-button"
            href={whatsappUrl(s.whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogo size={23} />
            Buy bundle on WhatsApp
          </a>
        ) : (
          <button disabled className="button">
            Choose all {s.bundleCount} fragrances
          </button>
        )}
      </div>
    </div>
  );
}

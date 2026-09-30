"use client";
import { useEffect, useRef, useState } from "react";
import {
  type TemplateRecord,
  type TemplateConfig,
  type TextLayer,
  assetUrl,
} from "@/lib/types";
import { fitText } from "@/lib/template-layout";
import { request, upload, Notice } from "./helpers";
type LayerKey = "name" | "brand" | "size";
export function TemplatesAdmin({
  templates: initial,
}: {
  templates: TemplateRecord[];
}) {
  const [templates, setTemplates] = useState(initial),
    [selected, setSelected] = useState(
      initial.find((t) => t.ready)?.id || initial[0].id,
    ),
    [active, setActive] = useState<LayerKey>("name"),
    [name, setName] = useState("BACCARAT ROUGE 540"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [proof, setProof] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null),
    dragging = useRef(false),
    grabOffset = useRef({ x: 0, y: 0 }),
    dragPosition = useRef<{ x: number; y: number } | null>(null),
    imageRef = useRef<HTMLImageElement | null>(null);
  const t = templates.find((t) => t.id === selected)!;
  const cfg = t.config,
    l = cfg[active];
  const change = (values: Partial<TemplateRecord>) => {
    setTemplates((old) =>
      old.map((x) => (x.id === selected ? { ...x, ...values } : x)),
    );
    setDirty(true);
    setProof("");
  };
  const layerChange = (key: keyof TextLayer, value: unknown) =>
    change({ config: { ...cfg, [active]: { ...l, [key]: value } } });
  useEffect(() => {
    if (!t.base) {
      imageRef.current = null;
      return;
    }
    const image = new window.Image();
    image.onload = () => {
      imageRef.current = image;
      draw();
    };
    image.onerror = () => setMessage("Could not load this master image.");
    image.src = assetUrl(t.base);
    return () => {
      image.onload = null;
    };
  }, [t.base, selected]);
  function draw(override?: TemplateConfig) {
    const current = override || cfg;
    const c = canvas.current,
      im = imageRef.current;
    if (!c || !im) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, t.width, t.height);
    ctx.drawImage(im, 0, 0, t.width, t.height);
    const cover = current.cover;
    if (cover.enabled)
      ctx.drawImage(
        im,
        cover.sourceX,
        cover.sourceY,
        cover.sourceWidth,
        cover.sourceHeight,
        cover.x,
        cover.y,
        cover.width,
        cover.height,
      );
    let error = "";
    (["name", "brand", "size"] as const).forEach((key) => {
      const text =
        key === "name"
          ? name.toUpperCase()
          : key === "brand"
            ? "Vaidora Perfume"
            : `${t.size} ML`;
      const layer = current[key];
      if (!layer.enabled) return;
      try {
        const fit = fitText(text, layer, (v, size) => {
          ctx.font = `${layer.weight} ${size}px "${layer.font}"`;
          return ctx.measureText(v).width;
        });
        ctx.save();
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.transform(1, 0, Math.tan((layer.skew * Math.PI) / 180), 1, 0, 0);
        ctx.font = `${layer.weight} ${fit.size}px "${layer.font}"`;
        ctx.fillStyle = layer.color;
        ctx.globalAlpha = layer.opacity;
        ctx.globalCompositeOperation =
          current.blend === "multiply" ? "multiply" : "source-over";
        ctx.textBaseline = "middle";
        ctx.filter = current.blur ? `blur(${current.blur}px)` : "none";
        fit.lines.forEach((line, i) => {
          const chars = [...line];
          const width =
            ctx.measureText(line).width +
            Math.max(0, chars.length - 1) * layer.spacing;
          let x =
            layer.align === "center"
              ? -width / 2
              : layer.align === "right"
                ? -width
                : 0;
          for (const char of chars) {
            ctx.fillText(
              char,
              x,
              (i - (fit.lines.length - 1) / 2) * fit.size * layer.lineHeight,
            );
            x += ctx.measureText(char).width + layer.spacing;
          }
        });
        ctx.restore();
        if (active === key) {
          ctx.save();
          ctx.translate(layer.x, layer.y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.strokeStyle = "#08a0e9";
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          const x =
            layer.align === "center"
              ? -layer.maxWidth / 2
              : layer.align === "right"
                ? -layer.maxWidth
                : 0;
          ctx.strokeRect(
            x,
            (-fit.size * layer.lineHeight * fit.lines.length) / 2 - 8,
            layer.maxWidth,
            fit.size * layer.lineHeight * fit.lines.length + 16,
          );
          ctx.restore();
        }
      } catch (e) {
        error = (e as Error).message;
      }
    });
    if (error) setMessage(error);
  }
  useEffect(() => {
    draw();
  }, [t.config, name, t.width, t.height, active]);
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - r.left) / r.width) * t.width),
      y: Math.round(((e.clientY - r.top) / r.height) * t.height),
    };
  };
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
          <h1>Product image templates</h1>
          <p>Your original photograph. Precisely positioned label text.</p>
        </div>
      </div>
      <div className="tabs template-tabs">
        {templates.map((x) => (
          <button
            key={x.id}
            className={x.id === selected ? "selected" : ""}
            onClick={() => {
              setSelected(x.id);
              setMessage("");
              setDirty(false);
              setProof("");
            }}
          >
            {x.size} ML {x.ready ? "✓" : "· setup"}
          </button>
        ))}
      </div>
      <Notice message={message} />
      <div className="template-layout">
        <section className="template-preview admin-panel">
          <div className="preview-toolbar">
            <label>
              Preview fragrance name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </label>
            <span className="small muted">
              Drag the selected text on the photograph. Coordinates use original
              image pixels.
            </span>
          </div>
          {t.base ? (
            <canvas
              ref={canvas}
              width={t.width}
              height={t.height}
              aria-label={`${t.size} ML template preview. Use X and Y fields to position text with the keyboard.`}
              onPointerDown={(e) => {
                const p = point(e);
                if (
                  Math.abs(p.x - l.x) <= l.maxWidth &&
                  Math.abs(p.y - l.y) < l.fontSize * l.maxLines * 1.5
                ) {
                  dragging.current = true;
                  grabOffset.current = { x: p.x - l.x, y: p.y - l.y };
                  dragPosition.current = { x: l.x, y: l.y };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }
              }}
              onPointerMove={(e) => {
                if (!dragging.current) return;
                const p = point(e);
                const position = {
                  x: Math.max(0, Math.min(t.width, p.x - grabOffset.current.x)),
                  y: Math.max(
                    0,
                    Math.min(t.height, p.y - grabOffset.current.y),
                  ),
                };
                dragPosition.current = position;
                draw({ ...cfg, [active]: { ...l, ...position } });
              }}
              onPointerUp={() => {
                if (dragging.current && dragPosition.current)
                  change({
                    config: {
                      ...cfg,
                      [active]: { ...l, ...dragPosition.current },
                    },
                  });
                dragging.current = false;
              }}
              onPointerCancel={() => {
                dragging.current = false;
                dragPosition.current = null;
                draw();
              }}
            />
          ) : (
            <div className="empty-state">
              <h2>Add the {t.size} ML photograph.</h2>
              <p>
                Upload the correct bottle master to start. Original pixels are
                retained.
              </p>
            </div>
          )}
          <p className="small muted">
            The blue guide is for positioning only. It is not included in
            exported images.
          </p>
        </section>
        <section className="template-controls admin-panel">
          <h2>{t.size} ML template</h2>
          <label>
            Master photograph
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                run(async () => {
                  const u = await upload(f);
                  change({
                    base: u.url,
                    width: u.width,
                    height: u.height,
                    ready: false,
                  });
                  setMessage(
                    "Original uploaded. Position your text and save the template.",
                  );
                });
              }}
            />
          </label>
          <label>
            Or choose a supplied photograph
            <select
              value={t.base.startsWith("/masters/") ? t.base : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                const gold = value.includes("gold-cap");
                change({
                  base: value,
                  width: gold ? 1536 : value.includes("100ml") ? 1122 : 1086,
                  height: gold ? 1024 : value.includes("100ml") ? 1402 : 1448,
                  ready: false,
                });
              }}
            >
              <option value="">Choose a master…</option>
              <option value="/masters/100ml.png">
                100 ML — gold square bottle
              </option>
              <option value="/masters/12ml.png">
                12 ML — red travel bottle
              </option>
              <option value="/masters/round-bottle-unassigned.png">
                Round bottle — confirm size
              </option>
              <option value="/masters/gold-cap-unassigned.png">
                Gold cap bottle — confirm size
              </option>
            </select>
          </label>
          <p className="small muted">
            Only assign the two unlabelled bottles after confirming their actual
            capacity.
          </p>
          <div className="tabs small-tabs">
            {(["name", "brand", "size"] as const).map((key) => (
              <button
                key={key}
                className={active === key ? "selected" : ""}
                onClick={() => setActive(key)}
              >
                {key === "name"
                  ? "Product name"
                  : key === "brand"
                    ? "Brand"
                    : "Size"}
              </button>
            ))}
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={l.enabled}
              onChange={(e) => layerChange("enabled", e.target.checked)}
            />
            Render {active} text
          </label>
          <div className="form-grid three">
            {(
              [
                { key: "x", label: "X position", min: 0, max: t.width },
                { key: "y", label: "Y position", min: 0, max: t.height },
                { key: "maxWidth", label: "Max width", min: 10, max: t.width },
                { key: "fontSize", label: "Preferred size", min: 6, max: 400 },
                { key: "minFontSize", label: "Minimum size", min: 6, max: 400 },
                { key: "maxLines", label: "Max lines", min: 1, max: 4 },
                { key: "spacing", label: "Letter spacing", min: -5, max: 30 },
                { key: "lineHeight", label: "Line height", min: 0.8, max: 2 },
                { key: "rotation", label: "Rotation °", min: -45, max: 45 },
                { key: "skew", label: "Skew °", min: -30, max: 30 },
                { key: "opacity", label: "Opacity", min: 0, max: 1 },
              ] as const
            ).map((f) => (
              <label key={f.key}>
                {f.label}
                <input
                  type="number"
                  step={
                    ["opacity", "lineHeight", "spacing"].includes(f.key)
                      ? 0.05
                      : 1
                  }
                  min={f.min}
                  max={f.max}
                  value={l[f.key]}
                  onChange={(e) => layerChange(f.key, Number(e.target.value))}
                />
              </label>
            ))}
          </div>
          <div className="form-grid">
            <label>
              Font
              <select
                value={l.font}
                onChange={(e) => layerChange("font", e.target.value)}
              >
                {["Arial", "Georgia", "Trebuchet MS"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Weight
              <select
                value={l.weight}
                onChange={(e) => layerChange("weight", Number(e.target.value))}
              >
                <option value={400}>Regular</option>
                <option value={700}>Bold</option>
              </select>
            </label>
            <label>
              Alignment
              <select
                value={l.align}
                onChange={(e) => layerChange("align", e.target.value)}
              >
                {["left", "center", "right"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Text colour
              <input
                type="color"
                value={l.color}
                onChange={(e) => layerChange("color", e.target.value)}
              />
            </label>
          </div>
          <details>
            <summary>Cover existing label text</summary>
            <p>
              For clean blank labels, leave this off. Otherwise, copy texture
              from a blank label area over the existing name. Photography
              outside this rectangle is retained.
            </p>
            <label className="check-label">
              <input
                type="checkbox"
                checked={cfg.cover.enabled}
                onChange={(e) =>
                  change({
                    config: {
                      ...cfg,
                      cover: { ...cfg.cover, enabled: e.target.checked },
                    },
                  })
                }
              />
              Use sampled label texture
            </label>
            <div className="form-grid three">
              {Object.entries(cfg.cover)
                .filter(([k]) => k !== "enabled")
                .map(([key, val]) => (
                  <label key={key}>
                    {key.replace(/([A-Z])/g, " $1")}
                    <input
                      type="number"
                      min={0}
                      value={Number(val)}
                      onChange={(e) =>
                        change({
                          config: {
                            ...cfg,
                            cover: {
                              ...cfg.cover,
                              [key]: Number(e.target.value),
                            },
                          },
                        })
                      }
                    />
                  </label>
                ))}
            </div>
          </details>
          <details>
            <summary>Print finish</summary>
            <div className="form-grid">
              <label>
                Blend mode
                <select
                  value={cfg.blend}
                  onChange={(e) =>
                    change({
                      config: {
                        ...cfg,
                        blend: e.target.value as TemplateConfig["blend"],
                      },
                    })
                  }
                >
                  <option value="multiply">Multiply into label</option>
                  <option value="over">Normal</option>
                </select>
              </label>
              <label>
                Subtle blur (0–2 px)
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={2}
                  value={cfg.blur}
                  onChange={(e) =>
                    change({ config: { ...cfg, blur: Number(e.target.value) } })
                  }
                />
              </label>
            </div>
          </details>
          <label className="check-label">
            <input
              type="checkbox"
              checked={t.ready}
              onChange={(e) => change({ ready: e.target.checked })}
            />
            Make this template available for bulk generation
          </label>
          <div className="actions">
            <button
              className="button"
              disabled={busy || !t.base}
              onClick={() =>
                run(async () => {
                  const saved = await request<TemplateRecord>(
                    "/api/admin/templates",
                    t,
                  );
                  setTemplates((old) =>
                    old.map((x) => (x.id === selected ? saved : x)),
                  );
                  setDirty(false);
                  setMessage("Template saved to the database.");
                })
              }
            >
              {busy ? "Working…" : "Save template"}
            </button>
            <button
              className="button outline"
              disabled={busy || dirty || !t.base}
              onClick={() =>
                run(async () => {
                  const r = await fetch("/api/admin/template-preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: t.id, name, config: cfg }),
                  });
                  if (!r.ok) throw new Error((await r.json()).error);
                  if (proof) URL.revokeObjectURL(proof);
                  setProof(URL.createObjectURL(await r.blob()));
                })
              }
            >
              Export proof
            </button>
          </div>
          {dirty && (
            <p className="small muted">
              Save your changes before exporting a server proof.
            </p>
          )}
          {proof && (
            <div className="exported-proof">
              <img src={proof} alt="Server-rendered product proof" />
              <a
                className="text-link"
                href={proof}
                download={`vaidora-${t.size}ml-proof.webp`}
              >
                Download WebP proof
              </a>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

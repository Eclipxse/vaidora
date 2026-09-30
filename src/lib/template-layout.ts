import type { TextLayer, TemplateConfig } from "./types";
export const layer = (overrides: Partial<TextLayer> = {}): TextLayer => ({
  enabled: true,
  x: 560,
  y: 674,
  maxWidth: 500,
  fontSize: 43,
  minFontSize: 18,
  maxLines: 2,
  font: "Arial",
  weight: 700,
  spacing: 0,
  align: "center",
  rotation: 0,
  skew: 0,
  color: "#15130f",
  opacity: 0.95,
  lineHeight: 1.15,
  ...overrides,
});
export function defaultTemplate(size: number): TemplateConfig {
  return {
    name: layer(),
    brand: layer({ enabled: false, y: 785, fontSize: 36 }),
    size: layer({ enabled: false, y: 852, fontSize: 26 }),
    cover: {
      enabled: false,
      x: 320,
      y: 642,
      width: 480,
      height: 76,
      sourceX: 320,
      sourceY: 597,
      sourceWidth: 480,
      sourceHeight: 43,
    },
    blend: "multiply",
    blur: 0,
  };
}
export function fitText(
  text: string,
  layer: TextLayer,
  measure: (text: string, size: number) => number,
) {
  const width = (s: string, n: number) =>
    measure(s, n) + Math.max(0, [...s].length - 1) * layer.spacing;
  for (let size = layer.fontSize; size >= layer.minFontSize; size--) {
    if (width(text, size) <= layer.maxWidth) return { lines: [text], size };
  }
  for (let size = layer.fontSize; size >= layer.minFontSize; size--) {
    const lines: string[] = [];
    let current = "";
    for (const word of text.split(/\s+/)) {
      if (width(word, size) > layer.maxWidth) {
        current = "";
        lines.length = layer.maxLines + 1;
        break;
      }
      const candidate = current ? `${current} ${word}` : word;
      if (width(candidate, size) > layer.maxWidth) {
        lines.push(current);
        current = word;
      } else current = candidate;
    }
    if (current) lines.push(current);
    if (lines.length && lines.length <= layer.maxLines) return { lines, size };
  }
  throw new Error(
    `“${text}” does not fit this label. Increase the width, allow more lines, or reduce the minimum font size.`,
  );
}

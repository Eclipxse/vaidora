export const SIZES = [6, 12, 20, 50, 100] as const;
export const VARIANT_SIZES = [6, 12, 20, 50, 100, 0] as const;
export const sizeLabel = (size: number) =>
  size === 0 ? "Car diffuser" : `${size} ML`;
export const assetUrl = (url: string) =>
  /^\/(products|uploads)\//.test(url) ? `/media${url}` : url;
export type Variant = {
  id: string;
  size: number;
  price: number;
  mrp: number;
  stock: number;
  enabled: boolean;
  image: string;
  imageSize: number | null;
};
export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  type: string;
  description: string;
  summary: string;
  notes: { top: string; heart: string; base: string };
  occasion: string;
  longevity: string;
  badges: string[];
  active: boolean;
  archived: boolean;
  featured: boolean;
  variants: Variant[];
  images: { id: string; url: string; alt: string }[];
  reviews: { id: string; author: string; rating: number; text: string }[];
};
export type TextLayer = {
  enabled: boolean;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  minFontSize: number;
  maxLines: number;
  font: string;
  weight: number;
  spacing: number;
  align: "center" | "left" | "right";
  rotation: number;
  skew: number;
  color: string;
  opacity: number;
  lineHeight: number;
};
export type TemplateConfig = {
  name: TextLayer;
  brand: TextLayer;
  size: TextLayer;
  cover: {
    enabled: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    sourceX: number;
    sourceY: number;
    sourceWidth: number;
    sourceHeight: number;
  };
  blend: "over" | "multiply";
  blur: number;
};
export type TemplateRecord = {
  id: string;
  size: number;
  name: string;
  base: string;
  width: number;
  height: number;
  config: TemplateConfig;
  ready: boolean;
  revision: number;
};
export type SiteSettings = {
  brand: string;
  whatsapp: string;
  announcement: string;
  previewMode: boolean;
  heroTitle: string;
  heroCopy: string;
  heroImage: string;
  heroLink: string;
  heroButton: string;
  bundleCount: number;
  bundlePrice: number;
  bundleSize: number;
  navigation: { label: string; href: string }[];
  sections: { title: string; filter: string; enabled: boolean }[];
  banners: { title: string; copy: string; image: string; href: string }[];
};
export const defaultSettings: SiteSettings = {
  brand: "VAIDORA",
  whatsapp: "917863065807",
  announcement: "Find your fragrance. Order personally on WhatsApp.",
  previewMode: true,
  heroTitle: "A scent that’s\nso you.",
  heroCopy:
    "From everyday favourites to unforgettable evenings. Discover your signature with Vaidora.",
  heroImage: "/masters/100ml.png",
  heroLink: "/collections",
  heroButton: "Explore fragrances",
  bundleCount: 3,
  bundlePrice: 0,
  bundleSize: 12,
  navigation: [
    { label: "All fragrances", href: "/collections" },
    { label: "Perfumes", href: "/collections/perfumes" },
    { label: "Attars", href: "/collections/attars" },
    { label: "For her", href: "/collections/women" },
    { label: "For him", href: "/collections/men" },
    { label: "Unisex", href: "/collections/unisex" },
    { label: "Build your bundle", href: "/bundle" },
  ],
  sections: [
    { title: "Find your signature", filter: "featured", enabled: true },
    { title: "The perfume edit", filter: "Perfume", enabled: true },
    { title: "Small bottle. Big personality.", filter: "Attar", enabled: true },
  ],
  banners: [
    {
      title: "Make it personal.",
      copy: "A fragrance for your everyday. A memory for someone special.",
      image: "/masters/gold-cap-unassigned.png",
      href: "/bundle",
    },
    {
      title: "Your scent, wherever.",
      copy: "Discover the 12 ML collection.",
      image: "/masters/12ml.png",
      href: "/collections?size=12",
    },
  ],
};
export const money = (n: number) =>
  n > 0
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n)
    : "Ask for price";
export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
export function productMessage(
  p: Pick<ProductRecord, "name" | "slug">,
  v: Pick<Variant, "size" | "price">,
  qty: number,
  origin: string,
) {
  return `Hi Vaidora! I’d like to buy:\n\nFragrance: ${p.name}\nOption: ${sizeLabel(v.size)}\nQuantity: ${qty}${v.price > 0 ? `\nListed price: ${money(v.price)} each` : ""}\n\nProduct: ${origin}/products/${p.slug}?size=${v.size}\n\nPlease confirm availability and the total including delivery.`;
}

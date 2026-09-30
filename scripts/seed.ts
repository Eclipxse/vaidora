import "dotenv/config";
import { db } from "../src/lib/db";
import {
  defaultSettings,
  slugify,
  SIZES,
  type TemplateRecord,
} from "../src/lib/types";
import { defaultTemplate } from "../src/lib/template-layout";
import { exportImage } from "../src/lib/compositor";
async function seed() {
  for (const size of SIZES) {
    const config = defaultTemplate(size);
    let base = "",
      width = 1122,
      height = 1402;
    if (size === 100) {
      base = "/masters/100ml.png";
      config.cover.enabled = true;
    }
    if (size === 12) {
      base = "/masters/12ml.png";
      width = 1086;
      height = 1448;
      config.name = {
        ...config.name,
        x: 528,
        y: 785,
        maxWidth: 302,
        fontSize: 39,
        minFontSize: 15,
      };
      config.cover = {
        enabled: true,
        x: 368,
        y: 750,
        width: 330,
        height: 65,
        sourceX: 368,
        sourceY: 682,
        sourceWidth: 330,
        sourceHeight: 35,
      };
    }
    await db.imageTemplate.upsert({
      where: { size },
      update: {},
      create: {
        size,
        name: `${size} ML template`,
        base,
        width,
        height,
        config: JSON.parse(JSON.stringify(config)),
        ready: !!base,
      },
    });
  }
  const existing = await db.setting.findUnique({ where: { key: "site" } });
  if (!existing) {
    const t = await db.imageTemplate.findUniqueOrThrow({
      where: { size: 100 },
    });
    const hero = await exportImage(
      t as unknown as TemplateRecord,
      "VAIDORA",
      "campaign",
    );
    await db.setting.create({
      data: { key: "site", value: { ...defaultSettings, heroImage: hero } },
    });
  }
  const cats = [
    ["Perfumes", "perfumes", "/masters/100ml.png"],
    ["Attars", "attars", "/masters/gold-cap-unassigned.png"],
    ["Women", "women", "/masters/round-bottle-unassigned.png"],
    ["Men", "men", "/masters/12ml.png"],
    ["Unisex", "unisex", "/masters/100ml.png"],
    ["Gift Sets", "gift-sets", "/masters/gold-cap-unassigned.png"],
  ];
  for (const [sort, [name, slug, image]] of cats.entries())
    await db.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name, image, sort },
    });
  for (const [slug, name, filter] of [
    ["new-arrivals", "New arrivals", { badge: "New" }],
    ["best-sellers", "Best sellers", { badge: "Best Seller" }],
    ["signature-edit", "The signature edit", { featured: true }],
  ] as const)
    await db.collection.upsert({
      where: { slug },
      update: {},
      create: { slug, name, filter },
    });
  const names = [
    ["Good Girl", "Women", "Perfume"],
    ["Black Opium", "Women", "Perfume"],
    ["Sauvage", "Men", "Perfume"],
    ["Bleu", "Men", "Perfume"],
    ["Oud Wood", "Unisex", "Attar"],
  ];
  for (const [i, [name, category, type]] of names.entries()) {
    const slug = slugify(name);
    if (await db.product.findUnique({ where: { slug } })) continue;
    const variants = [];
    for (const size of [12, 100]) {
      const t = await db.imageTemplate.findUniqueOrThrow({ where: { size } });
      const image = await exportImage(
        t as unknown as TemplateRecord,
        name,
        slug,
      );
      variants.push({
        size,
        price: 0,
        mrp: 0,
        stock: 0,
        image,
        imageSize: size,
        enabled: true,
      });
    }
    await db.product.create({
      data: {
        slug,
        name,
        category,
        type,
        summary: "Discover your next signature.",
        description: `Explore ${name} with Vaidora. Choose your preferred bottle size and speak with us for the fragrance profile, current availability and a personal recommendation.`,
        notes: {
          top: "Ask us about the opening notes",
          heart: "Ask us about the heart notes",
          base: "Ask us about the lasting notes",
        },
        badges: [],
        featured: i < 4,
        variants: { create: variants },
      },
    });
  }
  const pages = [
    [
      "about",
      "A fragrance feels personal.",
      "Vaidora Perfume makes discovering your next scent a personal conversation.\n\nExplore our collection, choose a fragrance and bottle size, then speak with us on WhatsApp. We will help you compare options and confirm availability before you order.",
    ],
    [
      "contact",
      "Let’s find your fragrance.",
      "For fragrance recommendations, availability, gifting and order enquiries, speak with Vaidora on WhatsApp at +91 78630 65807.",
    ],
    [
      "shipping",
      "Delivery information",
      "Share your delivery city and PIN code on WhatsApp. We will confirm delivery availability, charges and the expected dispatch time before accepting your order.",
    ],
    [
      "returns",
      "Returns & support",
      "If you have a concern about your order, contact Vaidora on WhatsApp with your order details. Ask us for the applicable return and cancellation terms before confirming a purchase.",
    ],
    [
      "privacy",
      "Your privacy",
      "This catalog does not collect payment information. Saved fragrances are stored in your browser. When you choose Buy on WhatsApp, the selected product details are included in a message for you to review and send. WhatsApp operates under its own privacy policy.",
    ],
    [
      "terms",
      "Ordering with Vaidora",
      "The catalog helps you discover fragrances and request details. Prices and availability are confirmed directly by Vaidora on WhatsApp. Opening a message does not place or pay for an order.",
    ],
    [
      "faq",
      "A few good questions.",
      "How do I order?|Open a fragrance, choose a size, then select Buy on WhatsApp. Review and send the message to us.\nCan you help me choose?|Yes. Tell us the fragrances or scent styles you enjoy on WhatsApp.\nWhich sizes can I order?|Each product page shows the sizes enabled for that fragrance. Confirm current stock with us.\nHow do I check delivery?|Send your city and PIN code on WhatsApp for a delivery estimate.\nCan I put together a gift?|Use Build your bundle to share your selection. We will confirm packaging, availability and the total.",
    ],
  ];
  for (const [slug, title, content] of pages)
    await db.page.upsert({
      where: { slug },
      update: {},
      create: { slug, title, content },
    });
  console.log("Catalog seeded. Original master photographs preserved.");
}
seed().finally(() => db.$disconnect());

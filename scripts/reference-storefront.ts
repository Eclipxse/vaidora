import "dotenv/config";
import { db } from "../src/lib/db";
import { getSettings } from "../src/lib/catalog";
async function main() {
  const s = await getSettings();
  await db.setting.update({
    where: { key: "site" },
    data: {
      value: {
        ...s,
        heroTitle: "Find your\nsignature scent.",
        heroCopy: "87 fragrances. Five sizes. A scent for every side of you.",
        heroButton: "Explore fragrances",
        heroLink: "/collections",
        announcement: "87 fragrances · Five sizes · Order directly on WhatsApp",
        sections: [
          {
            title: "Explore Our Signature Fragrances",
            filter: "featured",
            enabled: true,
          },
          { title: "The Fragrance Collection", filter: "all", enabled: true },
        ],
        banners: [
          {
            title: "Your favourites. Together.",
            copy: "Choose your own combination of Vaidora fragrances.",
            image: "/masters/gold-cap-unassigned.png",
            href: "/bundle",
          },
          {
            title: "Your scent.\nTo go.",
            copy: "Discover your favourite fragrance in a 12 ML bottle.",
            image: "/products/good-girl/12ml.webp",
            href: "/collections?size=12",
          },
        ],
      },
    },
  });
  console.log("Reference-led storefront settings saved. Catalog unchanged.");
}
main().finally(() => db.$disconnect());

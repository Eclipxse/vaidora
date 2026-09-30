import Image from "next/image";
import Link from "next/link";
import { getProducts, getSettings } from "@/lib/catalog";
import {
  CampaignSlider,
  CollectionShowcase,
  ProductRail,
  type Campaign,
} from "@/components/storefront-home";
import {
  ArrowRight,
  Drop,
  Ruler,
  CurrencyInr,
  ChatCircleText,
  WhatsappLogo,
  Heart,
  Gift,
} from "@/components/icons";
import { assetUrl, money, sizeLabel, whatsappUrl } from "@/lib/types";
export default async function Home() {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSettings(),
  ]);
  const photo = (slug: string, size = 100) =>
    products
      .find((p) => p.slug === slug)
      ?.variants.find((v) => v.enabled && v.size === size)?.image ||
    `/masters/${size === 12 ? 12 : 100}ml.png`;
  const cutout = (slug: string, size = 100) =>
    `/display/${slug}-${size}ml.png?v=contour-2`;
  const price = (size: number) =>
    Math.min(
      ...products.flatMap((p) =>
        p.variants
          .filter((v) => v.enabled && v.size === size)
          .map((v) => v.price),
      ),
    );
  const categories = [
    {
      name: "All Perfumes",
      href: "/collections",
      image: photo("tom-ford-oud-wood"),
      displayImage: cutout("tom-ford-oud-wood"),
    },
    {
      name: "Men’s Perfumes",
      href: "/collections/men",
      image: photo("dior-sauvage"),
      displayImage: cutout("dior-sauvage"),
    },
    {
      name: "Women’s Perfumes",
      href: "/collections/women",
      image: photo("good-girl"),
      displayImage: cutout("good-girl"),
    },
    {
      name: "Unisex Perfumes",
      href: "/collections/unisex",
      image: photo("white-oud"),
      displayImage: cutout("white-oud"),
    },
    {
      name: "100 ML Perfumes",
      href: "/collections?size=100",
      image: photo("tom-ford-oud-wood"),
      displayImage: cutout("tom-ford-oud-wood"),
    },
    {
      name: "Pocket Perfumes",
      href: "/collections?size=12",
      image: photo("ysl-libre", 12),
      displayImage: cutout("ysl-libre", 12),
    },
    {
      name: "Build A Bundle",
      href: "/bundle",
      image: photo("creed-aventus", 12),
      displayImage: cutout("creed-aventus", 12),
    },
  ];
  const slides: Campaign[] = [
    {
      title: "Discover Your\nSignature Scent",
      copy: `${products.length} fragrances. Five bottle sizes. Find your favourite with Vaidora Perfume.`,
      image: cutout("tom-ford-oud-wood"),
      alt: "Vaidora Tom Ford Oud Wood 100 ML bottle",
      href: "/collections",
      button: "Shop Now",
    },
    {
      title: "A Fragrance\nFor Every Day",
      copy: `Explore the men’s collection. 100 ML perfumes at ${money(price(100))}.`,
      image: cutout("dior-sauvage"),
      alt: "Vaidora Dior Sauvage 100 ML bottle",
      href: "/collections/men",
      button: "Explore Collection",
    },
    {
      title: "Make An\nUnforgettable Impression",
      copy: "Discover Good Girl, YSL Libre, Gucci Flora and more in our women’s collection.",
      image: cutout("good-girl"),
      alt: "Vaidora Good Girl 100 ML bottle",
      href: "/collections/women",
      button: "Shop Now",
    },
    {
      title: "Your Favourite\nFragrance, To Go",
      copy: `Pocket perfumes. 12 ML at ${money(price(12))}.`,
      image: cutout("ysl-libre", 12),
      alt: "Vaidora YSL Libre 12 ML bottle",
      href: "/collections?size=12",
      button: "Shop Pocket Perfumes",
    },
    {
      title: "Your Favourites.\nTogether.",
      copy: `Choose ${settings.bundleCount} fragrances in ${sizeLabel(settings.bundleSize)}. Ask us for your personal bundle price.`,
      image: cutout("creed-aventus", 12),
      alt: "Vaidora Creed Aventus 12 ML bottle",
      href: "/bundle",
      button: "Build Your Bundle",
    },
  ];
  const categoryRow = (mobile = false) => (
    <nav
      className={`category-circles${mobile ? " mobile-category-circles" : ""}`}
      aria-label={mobile ? "Quick collection links" : "Shop by category"}
    >
      {categories.map((category) => (
        <Link
          key={category.name}
          href={category.href}
          className="category-circle-item"
        >
          <div className="circle-image-wrap">
            <Image
              src={assetUrl(mobile ? category.image : category.displayImage)}
              alt=""
              fill
              sizes="(max-width:700px) 86px, 180px"
            />
          </div>
          <span>{category.name}</span>
        </Link>
      ))}
    </nav>
  );
  const featured = products.filter((p) => p.featured);
  const selection = [
    ...featured,
    ...products.filter((product) => !product.featured),
  ].slice(0, 10);
  return (
    <>
      <div className="mobile-category-bar">{categoryRow(true)}</div>
      <CampaignSlider slides={slides} />
      <div className="benefits-strip">
        <div className="container benefits-inner">
          <span>
            <Drop size={24} />
            {products.length} Fragrances
          </span>
          <span>
            <Ruler size={24} />
            Five Bottle Sizes
          </span>
          <span>
            <CurrencyInr size={24} />
            Fixed Catalog Prices
          </span>
          <span>
            <WhatsappLogo size={24} />
            Personal Assistance
          </span>
        </div>
      </div>
      <CollectionShowcase products={products} />
      <section className="shop-category">
        <div className="container">
          <h2 className="center-heading">Shop By Category</h2>
          {categoryRow()}
        </div>
      </section>
      <section className="store-product-section" id="featured">
        <div className="container">
          <ProductRail
            heading="Explore Our Fragrances"
            products={selection}
            label="featured fragrances"
          />
        </div>
      </section>
      <section
        className="promo-pair container"
        aria-label="Explore fragrance sizes"
      >
        <Link href="/collections?size=100" className="promo-panel">
          <Image
            src={assetUrl(photo("baccarat-rough-540"))}
            alt="Vaidora Baccarat Rough 540 100 ML bottle"
            fill
            sizes="(max-width:700px) 100vw, 50vw"
          />
          <div className="promo-panel-shade" />
          <div className="promo-content">
            <h2>{"Your Signature.\nFull Size."}</h2>
            <p>100 ML perfumes at {money(price(100))}</p>
            <span className="button">
              Shop Now <ArrowRight size={17} />
            </span>
          </div>
        </Link>
        <Link href="/collections?size=12" className="promo-panel">
          <Image
            src={assetUrl(photo("good-girl", 12))}
            alt="Vaidora Good Girl 12 ML bottle"
            fill
            sizes="(max-width:700px) 100vw, 50vw"
          />
          <div className="promo-panel-shade" />
          <div className="promo-content">
            <h2>{"Little Bottle.\nEndless Possibilities."}</h2>
            <p>12 ML pocket perfumes at {money(price(12))}</p>
            <span className="button">
              Shop Now <ArrowRight size={17} />
            </span>
          </div>
        </Link>
      </section>
      <section className="pocket-section" id="pocket">
        <div className="container pocket-layout">
          <div className="pocket-heading">
            <h2>Pocket Perfumes</h2>
            <Link className="text-link" href="/collections?size=12">
              View All <ArrowRight size={17} />
            </Link>
          </div>
          <ProductRail
            products={selection}
            preferredSize={12}
            label="pocket perfumes"
          />
        </div>
      </section>
      <Link href="/bundle" className="bundle-campaign container">
        <div className="bundle-campaign-photo">
          <Image
            src={assetUrl(photo("creed-aventus", 12))}
            alt="Vaidora Creed Aventus 12 ML bottle"
            fill
            sizes="(max-width:700px) 100vw, 50vw"
          />
        </div>
        <div className="bundle-campaign-content">
          <h2>{"A Collection\nMade By You"}</h2>
          <p>
            Pick {settings.bundleCount} fragrances. We’ll help you bring them
            together.
          </p>
          <span className="button">
            Build Your Bundle <ArrowRight size={18} />
          </span>
        </div>
      </Link>
      <section className="brand-story">
        <div className="container brand-story-inner">
          <div className="brand-story-copy">
            <h2>Meet Vaidora Perfume</h2>
            <p>
              A fragrance for the everyday, the occasion, and everything in
              between. Explore a collection of {products.length} names,
              including Dior Sauvage, Good Girl, White Oud and Tom Ford Oud
              Wood.
            </p>
            <p>
              Choose from 6 ML, 12 ML, 20 ML, 50 ML and 100 ML bottles, or a car
              diffuser. Every format has a fixed catalog price. Speak to us
              personally on WhatsApp to choose your fragrance and confirm your
              order.
            </p>
            <Link href="/about" className="text-link">
              More About Vaidora <ArrowRight size={18} />
            </Link>
          </div>
          <div className="brand-story-photo">
            <Image
              src={assetUrl(photo("white-oud"))}
              alt="Vaidora White Oud 100 ML bottle"
              fill
              sizes="(max-width:700px) 90vw, 40vw"
            />
          </div>
        </div>
      </section>
      <section className="why-vaidora">
        <div className="container">
          <h2 className="center-heading">The Vaidora Collection</h2>
          <div className="collection-facts">
            <div>
              <div className="fact-medallion">
                <Drop size={42} />
              </div>
              <span>
                {products.length} Fragrance
                <br />
                Choices
              </span>
            </div>
            <div>
              <div className="fact-medallion">
                <Ruler size={42} />
              </div>
              <span>
                Five Bottle
                <br />
                Sizes
              </span>
            </div>
            <div>
              <div className="fact-medallion">
                <CurrencyInr size={42} />
              </div>
              <span>
                Fixed Catalog
                <br />
                Prices
              </span>
            </div>
            <div>
              <div className="fact-medallion">
                <Heart size={42} />
              </div>
              <span>
                Save Your
                <br />
                Favourites
              </span>
            </div>
            <div>
              <div className="fact-medallion">
                <Gift size={42} />
              </div>
              <span>
                Create Your
                <br />
                Own Bundle
              </span>
            </div>
            <div>
              <div className="fact-medallion">
                <ChatCircleText size={42} />
              </div>
              <span>
                Personal
                <br />
                Assistance
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="size-guide container">
        <h2 className="center-heading">A Size For Every Moment</h2>
        <div className="price-formats">
          {[6, 12, 20, 50, 100, 0].map((size) => (
            <Link key={size} href={`/collections?size=${size}`}>
              <span>{sizeLabel(size)}</span>
              <strong>{money(price(size))}</strong>
            </Link>
          ))}
        </div>
      </section>
      <div className="order-region">
        <section className="order-guidance container">
          <h2>Order Directly From Vaidora</h2>
          <p>
            Choose a fragrance and bottle size, then open your selection in
            WhatsApp. We’ll confirm availability, delivery and the total with
            you before you order.
          </p>
          <a
            className="text-link"
            href={whatsappUrl(
              settings.whatsapp,
              "Hi Vaidora! I’d like to enquire about your fragrances.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogo size={20} /> +{settings.whatsapp}{" "}
            <ArrowRight size={17} />
          </a>
        </section>
      </div>
    </>
  );
}

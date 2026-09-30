import Link from "next/link";
import { ArrowUpRight } from "./icons";
import { BrandLogo } from "./brand-logo";
import { whatsappUrl, type SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="site-footer">
      <div className="container footer-main-grid">
        <div className="footer-brand">
          <BrandLogo width={150} height={78} />
          <p>
            Luxury fragrances. Fixed catalog prices.
            <br />
            Discover your everyday favourites with Vaidora.
          </p>
          <a
            className="text-link"
            href={whatsappUrl(
              settings.whatsapp,
              "Hi Vaidora! I have a fragrance enquiry.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            +{settings.whatsapp} <ArrowUpRight size={16} />
          </a>
        </div>
        <div>
          <h3>Categories</h3>
          <nav aria-label="Footer collection">
            <Link href="/collections">All fragrances</Link>
            <Link href="/collections/women">For her</Link>
            <Link href="/collections/men">For him</Link>
            <Link href="/collections/unisex">For everyone</Link>
            <Link href="/bundle">Build your collection</Link>
          </nav>
        </div>
        <div>
          <h3>Quick Links</h3>
          <nav aria-label="Customer care">
            <Link href="/about">About Vaidora</Link>
            <Link href="/contact">Contact Vaidora</Link>
            <Link href="/faq">Common questions</Link>
            <Link href="/policies/shipping">Shipping</Link>
            <Link href="/policies/returns">Returns</Link>
            <Link href="/wishlist">Saved fragrances</Link>
          </nav>
        </div>
        <div className="footer-order-note">
          <h3>Contact Vaidora</h3>
          <p>
            Choose your fragrance and size. We’ll confirm availability, delivery
            and the total with you on WhatsApp.
          </p>
          <Link className="text-link" href="/collections">
            Find your favourite <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Vaidora Perfume</span>
        <div>
          <Link href="/policies/privacy">Privacy</Link>
          <Link href="/policies/terms">Terms</Link>
          <Link href="/admin">Owner access</Link>
        </div>
      </div>
    </footer>
  );
}

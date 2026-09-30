# Storefront verification — 30 September 2026

Scope: the AdilQadri-reference redesign of Vaidora's public storefront. The latest request replaces the preceding cobalt/citron design. Cream, gold and burgundy, self-hosted Arsenal/Urbanist, the header, footer and product cards are shared by home, collections, search, saved fragrances, product details, bundle and information pages.

## Catalog and commercial truth

- The supplied three-page PDF was extracted and all 87 fragrance names compared with `docs/catalog-source.json`; the names match exactly.
- A read-only live database check confirmed 87 published products, 522 enabled size/price variants, equal MRP and price, and an existing image for every variant. The catalogue has 33 Men, 24 Women and 30 Unisex fragrances.
- Rates in INR: 6 ML 200; 12 ML 250; 20 ML 250; 50 ML 650; 100 ML 900; car diffuser 250. Bundle pricing remains an enquiry rather than an invented offer.
- Original Vaidora logo and bottle masters are retained. Product labels are deterministic derivatives of those photographs. Unphotographed formats retain representative-image disclosure.
- Product-specific draft links use the configured WhatsApp number `917863065807`. No message was sent and no payment or order was submitted.

## Completed checks

- `npm run build`: passed, including TypeScript, static-page generation and all public/admin dynamic routes.
- `npm run typecheck`: passed.
- `npm test`: all 10 passed, covering the 87 catalog records and 522 prices, WhatsApp draft contents, original photo pixels outside labels, label fitting, CSV/XLSX import, template validation, duplicate names and file-path protection.
- Prettier: all nine changed storefront implementation/configuration files passed after the final correction.
- Raster provenance: 198 shipping rasters scanned, zero missing origins. Metadata embedding preserves decoded pixels. Six foreground cutouts retain supplied bottle RGB; the full-bleed hero environment deterministically expands the real source photograph's empty side fields and tabletop.
- Impeccable detector: the single scan of the changed targets returned `[]` in `.impeccable/review/reference-detect.json`.
- Browser preview is running at `http://localhost:3000/`. The earlier failed tab was a browser error-page URL; a fresh ordinary HTTP tab works. The prior report's blanket local-browser restriction no longer applies.

## Rendered interaction evidence

Current UI checks, rather than the previous design's screenshots:

- Collection tabs: Women selection followed by ArrowRight selected Unisex and displayed eight products; Men restored afterward.
- Header search: `GOOD GIRL` returned the exact Women fragrance, 100 ML at ₹900.
- Catalog filter: `/collections?size=12` showed 12 ML at ₹250. GOOD GIRL was saved and removed again, restoring the original saved state.
- Product: GOOD GIRL selected 20 ML at ₹250 with quantity 2. The decoded WhatsApp draft contained the correct name, size, quantity, per-unit price and product URL. At 390 × 844, the sticky product action ended at the mobile navigation's top edge (778 px), without overlap.
- Bundle: GOOD GIRL, DIOR SAUVAGE and WHITE OUD composed a draft listing each at 12 ML, asking for availability, packaging and total. No bundle price was asserted.
- Mobile navigation drawer opened and closed; FAQ disclosure opened. These views and the product/bundle/catalog checks had no document overflow at 390 px.
- Self-hosted Arsenal and Urbanist were loaded in the browser.

## Visual evidence and review

Current captures live in `.impeccable/review/reference-build/`. `desktop.png` and `mobile.png` are full-page captures with real images loaded, captured from the document top at 1440 and 390 px. `reference-desktop.png` and `reference-mobile-hero.png` document the live reference. The reference's proprietary product artwork and unverified commercial claims are replaced with supplied Vaidora content; no pixel-identical claim is made.

The campaign's automatic width originally expanded at 320 and 768 px when aspect ratio combined with minimum height. Explicit width constraints resolve this. Final browser measurements at 320, 390, 768 and 1440 px show document widths equal to client widths (310, 380, 758 and 1430 px respectively), with no horizontal document overflow. All six final captures start at the document top with visible images and fonts loaded. The historical filenames `phone-320-before-fix.png` and `tablet-768-before-fix.png` now contain the corrected states to preserve the review packet's paths.

The independent review identified eight material corrections spanning the hero, dark/light section rhythm, category frames, product typography, decorative geometry, footer contrast, campaign outlines and design documentation. The final [verdict](../.impeccable/review/reference-finish-verdict.md) scores all eight resolved and returns `disposition: ship`. Required captures are valid and no material correction-batch regression was observed. This verdict covers those listed fixes, rather than an exhaustive review of every route or timed animation state.

No Lighthouse benchmark, public deployment, admin write operation, live WhatsApp message or payment was performed during this redesign. Subsequent full-hosting verification used a separate local container database and exercised owner writes there; see [DEPLOYMENT.md](DEPLOYMENT.md) and [RELEASE_CHECKS.json](RELEASE_CHECKS.json).

## Subsequent live deployment verification

The full application is now deployed through Cloudflare at `https://vaidoraperfume.com`. The production build passed on the owner's actual VPS using Node 24 and CPU-compatible native libraries. Ten core tests passed there. The live integration harness exercised all 17 public routes, owner authentication and editing, original image upload/serving, proofs and an approved background generation job; its results are in [PRODUCTION_INTEGRATION_RESULTS.json](PRODUCTION_INTEGRATION_RESULTS.json). Its uniquely named unpublished fixture was removed. No customer message or payment was sent.

The browser initially exposed an AVIF logo request that stalled on this VPS. WebP negotiation resolved it; the logo, hero photographs, category images and product rail then rendered. The production regression check requests both the logo and a product image with a browser's AVIF/WebP Accept header and decodes the successful WebP responses.

Live captures are saved locally under `.impeccable/review/production-2026-09-30/`: `desktop-home.png`, `desktop-products.png`, `mobile-home.png`, `mobile-product.png`, `owner-login.png`, `cloudflare-dns.png` and `cloudflare-strict-https.png`. The homepage captures start at scroll position zero with visible brand and campaign images loaded. At desktop width 1440, document and client widths were both 1430; at mobile width 390, both were 380. The mobile product also had no horizontal document overflow.

Live search returned GOOD GIRL and opened its detail route. Selecting 20 ML and quantity 2 produced the correct unsent WhatsApp draft: GOOD GIRL, 20 ML, two units at INR250 each and its production product URL. The mobile sticky purchase bar ended at 778 px, exactly where the 66 px bottom navigation started in the 844 px viewport. The mobile drawer opened and closed. The owner route redirected unauthenticated visitors to its working login form.

Cloudflare's saved configuration visibly confirmed Full (strict). The trusted origin certificate covers the apex and `www`; HTTP and `www` return canonical HTTPS redirects. Certbot's webroot renewal simulation succeeded, its timer is enabled/active, and its configured renewal hook tests and reloads Nginx. The previous redesign's local verification boundary above remains a historical record; these live checks supersede its deployment status.

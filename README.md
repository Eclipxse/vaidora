# Vaidora Perfume

A Next.js perfume catalog with product-specific WhatsApp enquiries and a protected owner studio. The public storefront follows the pinned AdilQadri homepage direction using Vaidora's supplied mark, original bottle photography and all 87 PDF fragrances. Cream, gold and burgundy surfaces pair self-hosted Arsenal headings with compact Urbanist controls; photographic campaigns, gold geometric frames, native product rails and fixed mobile navigation carry the browsing experience. See [the storefront design system](docs/DESIGN.md) for the implemented system and the independent visual-review boundary.

## Open locally

- Storefront: http://localhost:3000
- Owner studio: http://localhost:3000/admin
- Local owner credentials: [private/LOCAL_ACCESS.md](private/LOCAL_ACCESS.md). This file and `.env` are private; never publish them.

The preview uses PostgreSQL through Docker Desktop. If stopped, start Docker Desktop, then run from this folder:

```powershell
docker compose up -d
npm run dev
```

Run `npm run worker` in a second terminal for approved image batches.

## Catalog and buying flow

87 fragrances from the supplied PDF: 33 Men, 24 Women, 30 Unisex. Original spellings are retained. Each fragrance has 6 ML (INR200), 12 ML (INR250), 20 ML (INR250), 50 ML (INR650), 100 ML (INR900) and car diffuser (INR250) options.

Product cards open details. The customer chooses an option and quantity; **Buy on WhatsApp** opens a draft to **+91 78630 65807** with fragrance, option, quantity, listed price and product URL. The customer sends it themselves. There is no cart, checkout or payment collection.

Favorites and recently viewed fragrances stay on the customer's device. Search, category/size filters, sorting and a personal bundle selector are included.

## Owner studio

- Products: create, edit, archive/restore, duplicate, upload gallery images, manage variants/prices/stock, export CSV and update prices by size.
- Templates: master upload, draggable text placement, font fitting, spacing, rotation, skew, opacity, label-cover texture and server-generated proof.
- Bulk generation: paste names or import CSV/XLSX, choose approved sizes/prices, inspect proofs, approve the batch and monitor durable progress. The separate worker resumes interrupted jobs.
- Content: homepage campaigns/sections, navigation, categories, collections, pages, received reviews and store settings.

Images start from original masters. Only configured label regions change; no AI bottle regeneration is used. 174 labeled photographs are already generated: 12 ML and 100 ML for every fragrance.

## Photography and launch items

Only the 12 ML and 100 ML photographs have confirmed capacities. Other options use explicitly disclosed representative photography. Upload correctly assigned masters for 6/20/50 ML and the car diffuser before requiring exact imagery. Notes, longevity, stock, business details and final shipping/return terms still need owner input. No reference-site reviews, certifications, logos or campaign assets were copied.

The site has **not been deployed publicly**. It requires a Node host, PostgreSQL and durable image storage shared with its worker; static-only hosting cannot run the compositor.

## Fresh installation

Requires Node 20.19 or later, npm and PostgreSQL. Docker Compose supplies the local database.

```powershell
npm ci
node scripts/local-setup.cjs
# Start Docker Desktop before this command.
docker compose up -d
npm run db:generate
npm run db:setup
npx tsx scripts/import-catalog.ts
npx tsx scripts/reference-storefront.ts
npm run build
npm start
```

The setup script creates private local credentials when absent. Do not rerun catalog-import or reference-settings scripts after owner edits unless restoring defaults is intended.

For deployment, configure the production database, private owner credentials, a long random session secret and exact HTTPS APP_ORIGIN. Review schema changes and back up before running Prisma db push. Supervise the worker beside the web service. Persist and back up public/masters, public/uploads, public/products and PostgreSQL. Generated media are served via /media so new files work without restarting the server. Use an HTTPS reverse proxy. Local start scripts bind to loopback; containers can use `npx next start --hostname 0.0.0.0 --port 3000` behind that proxy.

## Verification

```powershell
npm test
npm run typecheck
npm run build
# With server and worker running:
npx tsx scripts/verify-integration.ts
```

Integration creates a uniquely named unpublished fixture and removes only that fixture, its images and job. No WhatsApp message is sent. See docs/VERIFICATION.md for observed results and the visual-verification limitation. Source data lives in docs/catalog-source.json and docs/vaidora-catalog.csv.

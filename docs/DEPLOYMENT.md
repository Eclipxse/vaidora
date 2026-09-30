# Deployment status — 30 September 2026

## GitHub

The complete application, original media, generated catalog photographs and design records are published at https://github.com/Eclipxse/vaidora on `main`. The first application commit is `c5354e3fcbdce5fd569848a9b259b12061f6ff97`; the repository's existing initial commit was preserved.

Local environment files, owner credentials, database data, dependencies, build output and design backups are excluded. Before publication, the staged files were checked against the actual local secret values; there were zero matches.

## Live deployment

The storefront is live at https://vaidoraperfume.com and the protected owner studio at https://vaidoraperfume.com/admin. Ubuntu 24.04 on the owner's existing VPS, `103.190.93.23`, runs the checkout in `/opt/vaidora`. The isolated Compose project `vaidora-production` supervises PostgreSQL 17, the Next.js web service and one image worker. Named volumes preserve the database, master photos, generated products and uploads. The web service binds only to `127.0.0.1:3080`; PostgreSQL has no public port. Existing websites and VPS services keep their original ports and configurations.

Cloudflare's proxied apex A record now points to this VPS. The existing proxied `www` CNAME points to the apex; mail records were preserved. Nginx routes the new domain to the loopback application and redirects HTTP and `www` to canonical HTTPS. The reusable virtual-host configuration is [deploy/nginx.conf](../deploy/nginx.conf).

The origin has a trusted Let's Encrypt certificate for both names, initially expiring 29 December 2026. Cloudflare uses **Full (strict)**. Certbot's webroot renewal simulation passed, the updated configuration uses `/var/www/vaidora-acme`, and the renewal timer is enabled and active. A successful renewal tests and gracefully reloads Nginx. Two temporary DNS challenge records remain from the initial issuance; future renewals use HTTP and do not depend on those records.

Production environment values were generated once and are private, including a unique owner password and session secret. The local handover file `private/owner-login.txt` is excluded from Git. Do not publish it or the server's `.env.production`.

This VPS exposes a baseline virtual CPU. The release uses [Dockerfile.baseline](../deploy/Dockerfile.baseline) to compile the current libvips/Sharp for that instruction set. Browser image negotiation uses WebP: the VPS's AVIF logo request stalled during browser verification, while WebP returned a valid image promptly. The integration harness now checks an actual browser Accept header against both the logo and a product photo.

## Verification

Live production HTTP/API checks are recorded in [PRODUCTION_INTEGRATION_RESULTS.json](PRODUCTION_INTEGRATION_RESULTS.json). They cover public routes, secure owner login, protected admin pages, cross-origin rejection, a real image upload, catalog counts, template proof, approved background generation, newly served media, editing, archiving and logout. The uniquely named unpublished QA fixture and its files are removed by the harness. No WhatsApp message or payment was sent.

The production Docker build and TypeScript checks passed on the actual VPS. All ten core tests also passed there, including unchanged source pixels outside configured label regions. Browser captures and responsive checks are recorded in [VERIFICATION.md](VERIFICATION.md).

Earlier local container verification passed in the separate Compose project `vaidora-release-check`:

- Production build and TypeScript passed on Linux with Node 24.
- All 10 core tests passed, including unchanged source pixels outside edited labels.
- All 17 public routes returned 200; protected owner access, origin checks, editing, archiving and logout passed.
- A proof was generated before approval; the supervised worker completed the approved two-image job, and new media worked without restarting the web service.
- Versioned product images returned an optimized 200 image response through Next.js. Their `/media/products` and `/media/uploads` query paths are explicitly supported.
- The new database imported 87 published fragrances and 522 enabled variants. Re-running bootstrap preserved an existing product edit; that verification edit was restored afterward.

Machine-readable release status is recorded in [RELEASE_CHECKS.json](RELEASE_CHECKS.json). The working preview database was not changed by those isolated checks.

## Operations

Run service commands from `/opt/vaidora`:

```sh
docker compose --env-file .env.production -f deploy/compose.yml ps
docker compose --env-file .env.production -f deploy/compose.yml logs --tail 50 web worker
```

For updates, back up the database and all media together, pull with `git pull --ff-only`, then build with the extra baseline configuration:

```sh
docker compose --env-file .env.production -f deploy/compose.yml -f deploy/compose.baseline.yml build web
docker compose --env-file .env.production -f deploy/compose.yml run --rm -T bootstrap </dev/null
docker compose --env-file .env.production -f deploy/compose.yml up -d web worker
```

The initial private backup is `/var/backups/vaidora/20260930T145739Z-k8q0PO`: a gzip-verified PostgreSQL dump, validated media archive, private environment file and Nginx configuration. The directory is root-only and its files use mode 600. This is one initial backup; scheduled and off-server backups are not configured. Take a new backup before catalog migrations or future upgrades. Keep named volumes intact and avoid rerunning catalog-import/reset scripts after owner edits.

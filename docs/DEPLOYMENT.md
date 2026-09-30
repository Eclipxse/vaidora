# Deployment status — 30 September 2026

## GitHub

The complete application, original media, generated catalog photographs and design records are published at https://github.com/Eclipxse/vaidora on `main`. The first application commit is `c5354e3fcbdce5fd569848a9b259b12061f6ff97`; the repository's existing initial commit was preserved.

Local environment files, owner credentials, database data, dependencies, build output and design backups are excluded. Before publication, the staged files were checked against the actual local secret values; there were zero matches.

## Cloudflare

Authenticated read-only checks confirmed that `vaidoraperfume.com` is an active zone in the available account. No existing DNS records were changed.

The Containers API returned an access error stating that running Containers requires Workers Paid. The existing application uses PostgreSQL, native Sharp/canvas rendering, persistent media and a separately supervised image worker. Publishing it as ordinary static files would omit the owner studio backend.

The selected setup keeps the full storefront and owner studio on a Node server with PostgreSQL and shared durable media, using the Cloudflare-managed domain. [FULL_HOSTING.md](FULL_HOSTING.md) describes the prepared deployment package. Cloudflare Containers remains an alternative only after its plan and persistent backend services are available.

Remote hosting is pending the server selection/access. Local container verification passed in the isolated Compose project `vaidora-release-check`:

- Production build and TypeScript passed on Linux with Node 24.
- All 10 core tests passed, including unchanged source pixels outside edited labels.
- All 17 public routes returned 200; protected owner access, origin checks, editing, archiving and logout passed.
- A proof was generated before approval; the supervised worker completed the approved two-image job, and new media worked without restarting the web service.
- Versioned product images returned an optimized 200 image response through Next.js. Their `/media/products` and `/media/uploads` query paths are explicitly supported.
- The new database imported 87 published fragrances and 522 enabled variants. Re-running bootstrap preserved an existing product edit; that verification edit was restored afterward.

Machine-readable results are recorded in [RELEASE_CHECKS.json](RELEASE_CHECKS.json). The working preview database was not changed by these isolated checks.

No Cloudflare deployment or domain cutover has been performed. The production build, ten core tests and responsive design checks passed before publication; their detailed evidence is recorded in [VERIFICATION.md](VERIFICATION.md).

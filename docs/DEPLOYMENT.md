# Deployment status — 30 September 2026

## GitHub

The complete application, original media, generated catalog photographs and design records are published at https://github.com/Eclipxse/vaidora on `main`. The first application commit is `c5354e3fcbdce5fd569848a9b259b12061f6ff97`; the repository's existing initial commit was preserved.

Local environment files, owner credentials, database data, dependencies, build output and design backups are excluded. Before publication, the staged files were checked against the actual local secret values; there were zero matches.

## Cloudflare

Authenticated read-only checks confirmed that `vaidoraperfume.com` is an active zone in the available account. No existing DNS records were changed.

The Containers API returned an access error stating that running Containers requires Workers Paid. The existing application uses PostgreSQL, native Sharp/canvas rendering, persistent media and a separately supervised image worker. Publishing it as ordinary static files would omit the owner studio backend.

Hosting is pending a launch-scope decision:

- Public storefront on Cloudflare free hosting, with a separate export build and the owner studio remaining local.
- Full storefront and owner studio on a Node server with PostgreSQL and shared durable media, using the Cloudflare-managed domain. Cloudflare Containers is an alternative only after its plan and persistent backend services are available.

No Cloudflare deployment or domain cutover has been performed. The production build, ten core tests and responsive design checks passed before publication; their detailed evidence is recorded in [VERIFICATION.md](VERIFICATION.md).

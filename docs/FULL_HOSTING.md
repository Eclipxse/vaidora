# Full storefront and owner studio hosting

The selected setup runs the existing Next.js application and image worker on a Node server, with PostgreSQL and persistent photo storage. Cloudflare manages `vaidoraperfume.com` and can proxy its HTTP/HTTPS traffic. This preserves live catalog editing, uploads, template proofs and bulk image generation.

## Included deployment package

- `Dockerfile`: Node 24 on Debian, native Sharp/canvas dependencies, generated Prisma client, production Next.js build and a non-root runtime.
- `deploy/compose.yml`: isolated PostgreSQL, web and worker services sharing persistent master/product/upload volumes. PostgreSQL has no public port; the application binds to host loopback port 3080.
- `deploy/catalog.snapshot.json`: the current products, variants, photo-template settings, categories, collections and information pages. Owner passwords, session secrets, login attempts and jobs are excluded.
- `scripts/bootstrap-production.ts`: initializes the schema and imports the snapshot into a new database. An existing catalog/settings database skips import to preserve owner edits. Schema changes never use `--accept-data-loss`.
- `scripts/create-production-env.cjs`: creates unique private production credentials once, without printing or overwriting them.
- `deploy/Caddyfile`: optional automatic HTTPS and a permanent `www` redirect.

## First installation on a Linux server

Install Docker Engine with Compose and Node 24. From the checkout:

```sh
git clone https://github.com/Eclipxse/vaidora.git
cd vaidora
node scripts/create-production-env.cjs
docker compose --env-file .env.production -f deploy/compose.yml build
docker compose --env-file .env.production -f deploy/compose.yml up -d db
docker compose --env-file .env.production -f deploy/compose.yml run --rm bootstrap
docker compose --env-file .env.production -f deploy/compose.yml up -d web worker
```

Read `.env.production` locally to obtain the owner login. Keep it private. Its `APP_ORIGIN` must be exactly `https://vaidoraperfume.com`; production sessions then use secure cookies and writes require that origin.

If the server already has an HTTPS reverse proxy, route this domain to `127.0.0.1:3080`. Otherwise, once DNS points to the server and ports 80/443 are available, start the optional Caddy service:

```sh
docker compose --env-file .env.production -f deploy/compose.yml --profile https up -d caddy
```

In Cloudflare, connect the apex to the server using a proxied A/AAAA record, and `www` to the apex using a proxied CNAME. Keep mail and verification records intact. Use Full (strict) TLS after the origin certificate is valid. Confirm the public storefront, owner login, uploads and worker before calling the cutover complete.

## Updates and backups

Back up PostgreSQL and all three media volumes together before updates. Update source with `git pull --ff-only`, rebuild the image, run bootstrap for safe schema synchronization, then restart web and worker. The bootstrap import skips a populated catalog. Do not rerun the local seed/import scripts against the production database after owner edits.

Container replacement preserves the named volumes. Removing a volume deletes its data, so upgrades must retain volumes and a recoverable backup. The worker runs one instance and resumes durable approved jobs after a restart.

## Release verification

The package is tested locally with the separate Compose project `vaidora-release-check`. Its database, media volumes and private credentials are independent of the working preview. Current results and the external-hosting boundary are recorded in [DEPLOYMENT.md](DEPLOYMENT.md).

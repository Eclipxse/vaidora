# Full storefront and owner studio hosting

The live setup runs the existing Next.js application and image worker on the owner's VPS at `/opt/vaidora`, with PostgreSQL and persistent photo storage. Cloudflare proxies `vaidoraperfume.com` with Full (strict) TLS. The existing Nginx server routes the new domain to loopback port 3080; Let's Encrypt uses automatic webroot renewal. This preserves live catalog editing, uploads, template proofs and bulk image generation. Current status and maintenance commands are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Included deployment package

- `Dockerfile`: Node 24 on Debian, native Sharp/canvas dependencies, generated Prisma client, production Next.js build and a non-root runtime.
- `deploy/compose.yml`: isolated PostgreSQL, web and worker services sharing persistent master/product/upload volumes. PostgreSQL has no public port; the application binds to host loopback port 3080.
- `deploy/catalog.snapshot.json`: the current products, variants, photo-template settings, categories, collections and information pages. Owner passwords, session secrets, login attempts and jobs are excluded.
- `scripts/bootstrap-production.ts`: initializes the schema and imports the snapshot into a new database. An existing catalog/settings database skips import to preserve owner edits. Schema changes never use `--accept-data-loss`.
- `scripts/create-production-env.cjs`: creates unique private production credentials once, without printing or overwriting them.
- `deploy/Caddyfile`: optional automatic HTTPS and a permanent `www` redirect.
- `deploy/nginx.conf`: the installed Vaidora-only virtual host for an existing Nginx server, with canonical redirects, upload limits and the certificate-renewal webroot.

## First installation on a Linux server

Before installing, run `bash scripts/vps-preflight.sh` on the selected server to inspect its OS, architecture, memory, disk, existing containers and listening ports. The script is read only and does not print environment variables or container credentials. Keep existing services and their ports intact.

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

## Servers with older virtual CPU instruction sets

Some VPS providers expose a baseline QEMU CPU without SSE4.2. Sharp's current prebuilt Linux x64 binaries require a newer instruction set. On those hosts, use the additional Compose file for builds:

```sh
docker compose --env-file .env.production -f deploy/compose.yml -f deploy/compose.baseline.yml build
```

The alternate Dockerfile builds the current libvips 8.18.6 release and Sharp from source for baseline x86-64. The libvips source archive has a pinned SHA-256 checksum, and an image-processing check runs before the application build. This adds build time but keeps the same web, worker, database and persistent volumes. Normal startup/update commands still use `deploy/compose.yml`; retain the extra file whenever rebuilding on this VPS.

## Updates and backups

Back up PostgreSQL and all three media volumes together before updates. Update source with `git pull --ff-only`, rebuild the image, run bootstrap for safe schema synchronization, then restart web and worker. The bootstrap import skips a populated catalog. Do not rerun the local seed/import scripts against the production database after owner edits.

Container replacement preserves the named volumes. Removing a volume deletes its data, so upgrades must retain volumes and a recoverable backup. The worker runs one instance and resumes durable approved jobs after a restart.

## Release verification

The package was tested locally with the separate Compose project `vaidora-release-check`, then built and exercised on the actual VPS through the public Cloudflare HTTPS domain. The isolated local database and media remain independent of the working preview and production. Current results are recorded in [DEPLOYMENT.md](DEPLOYMENT.md).

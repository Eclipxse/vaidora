FROM node:24-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates openssl fonts-liberation fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npm run db:generate
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npm run build

FROM base AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN groupadd --gid 10001 vaidora && useradd --uid 10001 --gid vaidora --create-home vaidora
COPY --from=build --chown=vaidora:vaidora /app/node_modules ./node_modules
COPY --from=build --chown=vaidora:vaidora /app/.next ./.next
COPY --from=build --chown=vaidora:vaidora /app/public ./public
COPY --from=build --chown=vaidora:vaidora /app/prisma ./prisma
COPY --from=build --chown=vaidora:vaidora /app/src ./src
COPY --from=build --chown=vaidora:vaidora /app/scripts ./scripts
COPY --from=build --chown=vaidora:vaidora /app/docs ./docs
COPY --from=build --chown=vaidora:vaidora /app/deploy ./deploy
COPY --from=build --chown=vaidora:vaidora /app/package.json /app/tsconfig.json /app/next.config.ts ./
RUN mkdir -p public/uploads && chown -R vaidora:vaidora public/uploads
USER vaidora
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", "3000"]

# Prerender demo: Stencil build → Node hydrate API + PHP static router + demo UI (single process tree via entrypoint).

FROM node:20-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends php-cli ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/hydrate ./hydrate
COPY scripts/prerender-server ./scripts/prerender-server
COPY scripts/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV WEB_PORT=8088 \
  PRERENDER_HOST=127.0.0.1 \
  PRERENDER_PORT=4711 \
  EASYCREDIT_PRERENDER_URL=http://127.0.0.1:4711

EXPOSE 8088

HEALTHCHECK --interval=30s --timeout=3s --start-period=8s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${WEB_PORT}/" > /dev/null || exit 1

ENTRYPOINT ["/entrypoint.sh"]

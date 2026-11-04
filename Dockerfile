# Prerender service: Stencil build → Node hydrate workers + static component files.

FROM node:24-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends php-cli ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/hydrate ./hydrate
COPY scripts/prerender-server ./scripts/prerender-server
COPY scripts/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Defaults. Override any of these at runtime (`docker run -e`, Compose `environment`, or `.env`).
ENV WEB_PORT=8088 \
  PRERENDER_HOST=0.0.0.0 \
  PRERENDER_PORT=4711 \
  PRERENDER_WORKERS=2 \
  PRERENDER_WORKER_CONCURRENCY=4 \
  PRERENDER_BUDGET_MS=1000 \
  PRERENDER_WORKER_PORT_BASE=4721 \
  PRERENDER_TIMEOUT=15000 \
  PRERENDER_MAX_BODY=1048576

EXPOSE 4711 8088

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PRERENDER_PORT}/health" >/dev/null \
    && curl -fsS "http://127.0.0.1:${WEB_PORT}/easycredit-components/easycredit-components.esm.js" >/dev/null || exit 1

ENTRYPOINT ["/entrypoint.sh"]

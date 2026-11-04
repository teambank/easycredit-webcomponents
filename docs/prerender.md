# Prerender server

The prerender container renders easyCredit web components to HTML and serves the static component bundle.

- Node on port **4711** accepts `POST /render` and `GET /health`.
- Port **8088** serves the built files. Component scripts are under `/easycredit-components/`.

A master process on 4711 forwards each fragment to a render worker. Fragments with the same `webshop-id` stay on the same worker, so that worker can reuse its webshop and installment-plan cache.

## Start

From this repository:

```bash
docker compose up --build
```

Stop an already running container named `easycredit-prerender` first. Compose uses that name, and the host ports are `127.0.0.1:4711` and `127.0.0.1:8088`.

Check:

```bash
curl -fsS http://127.0.0.1:4711/health
curl -fsS -o /dev/null -w '%{http_code}\n' \
  http://127.0.0.1:8088/easycredit-components/easycredit-components.esm.js
```

The same image without Compose:

```bash
docker build -t easycredit-prerender:local .
docker run -d --name easycredit-prerender \
  -e PRERENDER_WORKERS=2 \
  -p 127.0.0.1:4711:4711 \
  -p 127.0.0.1:8088:8088 \
  easycredit-prerender:local
```

Every variable in the table below can be set with `-e` or in a `.env` file. Copy `.env.example` to `.env` and change what you need, then recreate the container.

## Shop plugin

Attach this service to the plugin stack's Docker network:

```bash
PLUGIN_NETWORK=your_stack_web \
  docker compose -f docker-compose.yml -f docker-compose.network.yml up --build
```

From another container on that network the API is `http://easycredit-prerender:4711`. Point the plugin's prerender URL at that address.

A browser on the host cannot resolve `easycredit-prerender`. Load the component script from the published port:

```text
http://127.0.0.1:8088/easycredit-components/easycredit-components.esm.js
```

`localhost` is the same port. Static responses send `Access-Control-Allow-Origin: *`, so a page on another origin can load the module.

## Settings

| Variable | Default | Effect |
|---|---|---|
| `WEB_PORT` | `8088` | Static file server inside the container |
| `PRERENDER_HOST` | `0.0.0.0` | Address the Node master binds. `0.0.0.0` is reachable from other containers |
| `PRERENDER_PORT` | `4711` | Node master port, also the published host port |
| `PRERENDER_WORKERS` | `2` | Render processes. Each has its own cache |
| `PRERENDER_WORKER_CONCURRENCY` | `4` | Renders in flight on one worker |
| `PRERENDER_BUDGET_MS` | `1000` | If a request would wait longer than this, the master returns HTTP 503 and `html: null` |
| `PRERENDER_WORKER_PORT_BASE` | `4721` | First worker port. Workers listen on `127.0.0.1` only |
| `PRERENDER_TIMEOUT` | `15000` | Aborts a render whose component data fetch is stuck |
| `PRERENDER_MAX_BODY` | `1048576` | Maximum JSON body in bytes |
| `PRERENDER_HYDRATE_URL` | `https://ratenkauf.easycredit.de/` | Page URL seen by components during render |
| `PLUGIN_NETWORK` | | Docker network name for `docker-compose.network.yml` |

`PRERENDER_WORKER_PORT_BASE` and the following worker ports must not be `PRERENDER_PORT`. Changing `PRERENDER_WORKERS` moves shops onto different processes, so the next render for each shop fetches again.

Webshop info stays cached for one hour. Installment plans stay cached for 10 seconds. Both live in the worker process, not in a shared store.

## Traefik

```bash
docker network create web   # once
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up --build
```

Traefik routes to the static file port (`WEB_PORT`). The Node API stays on `PRERENDER_PORT` inside the Docker network.

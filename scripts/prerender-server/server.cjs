/**
 * HTTP service: Stencil hydrate (Node) for PHP or other backends.
 *
 * Run after `npm run build` (needs ../hydrate).
 *
 *   PRERENDER_HOST=127.0.0.1 PRERENDER_PORT=4711 npm run prerender:serve
 *   node scripts/prerender-server/server.cjs --hydrate-url https://staging.example/
 *   PRERENDER_HYDRATE_URL=https://… npm run prerender:serve   (if no --hydrate-url)
 *
 * POST /render  Content-Type: application/json
 *   { "html": "<easycredit-logo webshop-id=\"…\"></easycredit-logo>", "options": { ... } }
 * Stencil hydrate options.url is set at server start (not overridable per request).
 *
 * GET /health → "ok"
 */

const http = require('http');
const path = require('path');
const { renderToString } = require(path.join(__dirname, '../../hydrate/index.js'));

const HOST = process.env.PRERENDER_HOST || '127.0.0.1';
const PORT = parseInt(process.env.PRERENDER_PORT || '4711', 10);

const DEFAULT_HYDRATE_PAGE_URL = 'https://ratenkauf.easycredit.de/';

/**
 * @param {string[]} argv
 * @returns {string | null}
 */
function parseCliHydrateUrl(argv) {
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--hydrate-url=')) {
      return a.slice('--hydrate-url='.length);
    }
    if (a === '--hydrate-url' && i + 1 < args.length) {
      return args[i + 1];
    }
  }
  return null;
}

/**
 * Mock page URL for Stencil hydrate (see generateHydrateResults in hydrate/index.*).
 * CLI `--hydrate-url` wins over PRERENDER_HYDRATE_URL, then default.
 */
function resolveHydratePageUrl(argv, env) {
  const raw =
    parseCliHydrateUrl(argv) ||
    (typeof env.PRERENDER_HYDRATE_URL === 'string' && env.PRERENDER_HYDRATE_URL.trim() !== ''
      ? env.PRERENDER_HYDRATE_URL.trim()
      : DEFAULT_HYDRATE_PAGE_URL);
  let u;
  try {
    u = new URL(raw);
  } catch {
    // eslint-disable-next-line no-console
    console.error('Invalid hydrate page URL (must be absolute http(s)):', raw);
    process.exit(1);
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    // eslint-disable-next-line no-console
    console.error('Invalid hydrate page URL protocol:', raw);
    process.exit(1);
  }
  let href = u.href;
  if (!href.endsWith('/')) {
    href += '/';
  }
  return href;
}

const HYDRATE_PAGE_URL = resolveHydratePageUrl(process.argv, process.env);

const MAX_BODY_BYTES = parseInt(process.env.PRERENDER_MAX_BODY || '1048576', 10);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (c) => {
      total += c.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url.split('?')[0] === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('ok');
    return;
  }

  if (req.method === 'POST' && req.url.split('?')[0] === '/render') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    try {
      const raw = await readBody(req);
      let payload;
      try {
        payload = JSON.parse(raw || '{}');
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ html: null, error: 'invalid JSON body' }));
        return;
      }
      const fragment = typeof payload.html === 'string' ? payload.html : '';
      const userOpts =
        payload.options && typeof payload.options === 'object' ? payload.options : {};
      const options = {
        fullDocument: false,
        serializeShadowRoot: 'declarative-shadow-dom',
        ...userOpts,
      };
      options.url = HYDRATE_PAGE_URL;

      const result = await renderToString(fragment, options);
      const diagnostics = (result.diagnostics || []).map((d) => ({
        level: d.level,
        messageText: d.messageText,
      }));

      const status = diagnostics.some((d) => d.level === 'error') ? 422 : 200;
      res.writeHead(status);
      res.end(
        JSON.stringify({
          html: result.html,
          hydratedCount: result.hydratedCount,
          diagnostics,
        }),
      );
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      const status = /too large/.test(msg) ? 413 : 500;
      res.writeHead(status);
      res.end(
        JSON.stringify({
          html: null,
          error: msg,
        }),
      );
    }
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`easycredit prerender listening on http://${HOST}:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`hydrate page URL: ${HYDRATE_PAGE_URL}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

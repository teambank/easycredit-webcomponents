/**
 * HTTP service: Stencil hydrate (Node) for PHP or other backends.
 *
 * One render worker. The public entrypoint is master.cjs, which starts several
 * of these processes and routes each webshop id to the same worker.
 *
 *   node scripts/prerender-server/server.cjs --hydrate-url https://staging.example/
 *   PRERENDER_HYDRATE_URL=https://… node scripts/prerender-server/server.cjs
 *
 * POST /render  Content-Type: application/json
 *   { "html": "<easycredit-logo webshop-id=\"…\"></easycredit-logo>" }
 * Request `options` are ignored. Stencil hydrate options.url and options.timeout
 * are set at server start. timeout aborts a stuck componentWillLoad and its
 * in-flight fetch (Stencil >= 4.45).
 *
 *   PRERENDER_TIMEOUT=15000   milliseconds, default 15000
 *   PRERENDER_MAX_COMPONENTS=32
 *
 * GET /health → "ok"
 */

const http = require('http');
const path = require('path');
const { renderToString } = require(path.join(__dirname, '../../hydrate/index.js'));

const HOST = process.env.PRERENDER_HOST || '127.0.0.1';
const PORT = parseInt(process.env.PRERENDER_PORT || '4711', 10);
const DEFAULT_HYDRATE_TIMEOUT_MS = 15000;
const DEFAULT_MAX_COMPONENTS = 32;
const WEBSHOP_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;
const STENCIL_DOC_DATA = '_stencilDocData';

const ALLOWED_COMPONENTS = new Set([
  'easycredit-accordion',
  'easycredit-accordion-item',
  'easycredit-base',
  'easycredit-box-flash',
  'easycredit-box-listing',
  'easycredit-box-modal',
  'easycredit-box-top',
  'easycredit-checkout',
  'easycredit-checkout-bill-payment-timeline',
  'easycredit-checkout-installments',
  'easycredit-checkout-label',
  'easycredit-checkout-privacy-approval',
  'easycredit-checkout-totals',
  'easycredit-express-button',
  'easycredit-express-button-single',
  'easycredit-faq',
  'easycredit-infopage',
  'easycredit-logo',
  'easycredit-merchant-manager',
  'easycredit-merchant-status-widget',
  'easycredit-modal',
  'easycredit-widget',
]);

function resolveHydrateTimeoutMs(env) {
  const raw = env.PRERENDER_TIMEOUT;
  if (typeof raw !== 'string' || raw.trim() === '') {
    return DEFAULT_HYDRATE_TIMEOUT_MS;
  }
  const ms = parseInt(raw, 10);
  if (!Number.isFinite(ms) || ms <= 0) {
    // eslint-disable-next-line no-console
    console.error('Invalid PRERENDER_TIMEOUT (positive milliseconds):', raw);
    process.exit(1);
  }
  return ms;
}

function resolveMaxComponents(env) {
  const raw = env.PRERENDER_MAX_COMPONENTS;
  if (typeof raw !== 'string' || raw.trim() === '') {
    return DEFAULT_MAX_COMPONENTS;
  }
  const value = parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    // eslint-disable-next-line no-console
    console.error('Invalid PRERENDER_MAX_COMPONENTS (positive integer):', raw);
    process.exit(1);
  }
  return value;
}

const HYDRATE_TIMEOUT_MS = resolveHydrateTimeoutMs(process.env);
const MAX_COMPONENTS = resolveMaxComponents(process.env);

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
        const error = new Error('request body too large');
        error.status = 413;
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function collectComponentTags(html) {
  const tags = [];
  const re = /<\s*([a-z][a-z0-9-]*)\b/gi;
  let match;
  while ((match = re.exec(html))) {
    tags.push(match[1].toLowerCase());
  }
  return tags;
}

function validateFragment(html) {
  const tags = collectComponentTags(html);
  const easycreditTags = tags.filter((tag) => tag.startsWith('easycredit-'));
  if (easycreditTags.length === 0) {
    const error = new Error('no easycredit component in html');
    error.status = 400;
    throw error;
  }
  if (easycreditTags.length > MAX_COMPONENTS) {
    const error = new Error('too many components in html');
    error.status = 400;
    throw error;
  }
  const disallowed = easycreditTags.find((tag) => !ALLOWED_COMPONENTS.has(tag));
  if (disallowed) {
    const error = new Error('component not allowed: ' + disallowed);
    error.status = 400;
    throw error;
  }

  const webshopMatch = /webshop-id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(html);
  if (webshopMatch) {
    const id = (webshopMatch[1] || webshopMatch[2] || webshopMatch[3] || '').trim();
    if (id && !WEBSHOP_ID_PATTERN.test(id)) {
      const error = new Error('invalid webshop id');
      error.status = 400;
      throw error;
    }
  }
}

function resetHydrateIds(document) {
  const docData = document && document[STENCIL_DOC_DATA];
  if (!docData || typeof docData !== 'object') {
    return;
  }
  docData.hostIds = 0;
  docData.rootLevelIds = 0;
}

let renderChain = Promise.resolve();

function renderFragment(fragment) {
  const run = async () => {
    const options = {
      fullDocument: false,
      serializeShadowRoot: 'declarative-shadow-dom',
      maxHydrateCount: MAX_COMPONENTS,
      url: HYDRATE_PAGE_URL,
      timeout: HYDRATE_TIMEOUT_MS,
      beforeHydrate(document) {
        resetHydrateIds(document);
      },
      afterHydrate(document) {
        resetHydrateIds(document);
      },
    };
    return renderToString(fragment, options);
  };

  const job = renderChain.then(run, run);
  renderChain = job.then(
    () => undefined,
    () => undefined,
  );
  return job;
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
      try {
        validateFragment(fragment);
      } catch (error) {
        res.writeHead(error && error.status ? error.status : 400);
        res.end(
          JSON.stringify({
            html: null,
            error: error && error.message ? error.message : String(error),
          }),
        );
        return;
      }

      const result = await renderFragment(fragment);
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
      const status = err && err.status ? err.status : /too large/.test(msg) ? 413 : 500;
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
  // eslint-disable-next-line no-console
  console.log(`hydrate timeout: ${HYDRATE_TIMEOUT_MS}ms`);
  // eslint-disable-next-line no-console
  console.log(`max components: ${MAX_COMPONENTS}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

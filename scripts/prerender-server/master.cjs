/**
 * Public prerender API. Spawns N render workers (server.cjs) and sends every
 * fragment for a webshop id to the same worker, so that worker's caches stay warm.
 *
 *   PRERENDER_HOST=0.0.0.0 PRERENDER_PORT=4711 PRERENDER_WORKERS=2 npm run prerender:serve
 *
 *   PRERENDER_WORKERS=2                  default 2
 *   PRERENDER_WORKER_CONCURRENCY=4       renders in flight per worker
 *   PRERENDER_BUDGET_MS=1000             matches the Shopware prerender budget
 *   PRERENDER_WORKER_PORT_BASE=4721      workers listen on 127.0.0.1 from here
 *
 * A request that would miss the budget is answered with HTTP 503 and html null.
 * The Shopware client then keeps the original tag and does not cache that miss.
 *
 * GET /health → "ok" once any worker is ready
 */

const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const SERVER_PATH = path.join(__dirname, 'server.cjs');
const HOST = process.env.PRERENDER_HOST || '127.0.0.1';
const PORT = positiveInt('PRERENDER_PORT', 4711);
const WORKER_COUNT = positiveInt('PRERENDER_WORKERS', 2);
const CONCURRENCY = positiveInt('PRERENDER_WORKER_CONCURRENCY', 4);
const BUDGET_MS = positiveInt('PRERENDER_BUDGET_MS', 1000);
const WORKER_PORT_BASE = positiveInt('PRERENDER_WORKER_PORT_BASE', 4721);
const MAX_BODY_BYTES = positiveInt('PRERENDER_MAX_BODY', 1048576);
const HYDRATE_TIMEOUT_MS = positiveInt('PRERENDER_TIMEOUT', 15000);

function positiveInt(name, fallback) {
  const raw = process.env[name];
  if (typeof raw !== 'string' || raw.trim() === '') {
    return fallback;
  }
  const value = parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    // eslint-disable-next-line no-console
    console.error('Invalid ' + name + ' (positive integer):', raw);
    process.exit(1);
  }
  return value;
}

for (let i = 0; i < WORKER_COUNT; i++) {
  if (WORKER_PORT_BASE + i === PORT) {
    // eslint-disable-next-line no-console
    console.error('Worker ports overlap PRERENDER_PORT', PORT);
    process.exit(1);
  }
}

function webshopIdFromFragment(html) {
  const match = /webshop-id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(html);
  if (!match) {
    return null;
  }
  const id = (match[1] || match[2] || match[3] || '').trim();
  return id || null;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        const error = new Error('request body too large');
        error.status = 413;
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let roundRobin = 0;
let shuttingDown = false;

const workers = [];

function estimatedWaitMs(worker) {
  const ahead = worker.inFlight + worker.queue.length;
  if (ahead === 0) {
    return 0;
  }
  return Math.ceil(ahead / CONCURRENCY) * worker.avgMs;
}

function budgetError(worker) {
  const error = new Error('render queue exceeded shop budget');
  error.status = 503;
  error.workerIndex = worker.index;
  return error;
}

function settle(job, fn) {
  if (job.settled) {
    return;
  }
  job.settled = true;
  fn();
}

function failQueued(worker, error) {
  const queued = worker.queue.splice(0);
  queued.forEach((job) => settle(job, () => job.reject(error)));
}

function pump(worker) {
  while (worker.ready && worker.inFlight < CONCURRENCY && worker.queue.length > 0) {
    const job = worker.queue[0];
    if (Date.now() - job.enqueuedAt >= BUDGET_MS) {
      worker.queue.shift();
      settle(job, () => job.reject(budgetError(worker)));
      continue;
    }
    worker.queue.shift();
    worker.inFlight += 1;
    runJob(worker, job);
  }
}

function forward(worker, raw) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: worker.port,
        path: '/render',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': raw.length,
        },
        timeout: HYDRATE_TIMEOUT_MS + 1000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 502,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error('worker timed out')));
    req.on('error', reject);
    req.end(raw);
  });
}

async function runJob(worker, job) {
  const generation = worker.generation;
  const started = Date.now();
  try {
    const result = await forward(worker, job.raw);
    const duration = Date.now() - started;
    if (worker.generation === generation) {
      worker.avgMs = worker.avgMs * 0.7 + duration * 0.3;
    }
    settle(job, () => job.resolve(result));
  } catch (error) {
    settle(job, () => job.reject(error));
  } finally {
    if (worker.generation === generation) {
      worker.inFlight = Math.max(0, worker.inFlight - 1);
      pump(worker);
    }
  }
}

function enqueue(worker, raw) {
  if (estimatedWaitMs(worker) >= BUDGET_MS) {
    // eslint-disable-next-line no-console
    console.error(
      'prerender budget exceeded for worker ' + worker.index +
      ' (inFlight=' + worker.inFlight +
      ' queued=' + worker.queue.length +
      ' avg=' + Math.round(worker.avgMs) + 'ms)',
    );
    return Promise.reject(budgetError(worker));
  }
  return new Promise((resolve, reject) => {
    worker.queue.push({
      raw,
      resolve,
      reject,
      enqueuedAt: Date.now(),
      settled: false,
    });
    pump(worker);
  });
}

function chooseWorker(fragment) {
  const webshopId = webshopIdFromFragment(fragment);
  if (!webshopId) {
    const index = roundRobin;
    roundRobin = (roundRobin + 1) % workers.length;
    return workers[index];
  }
  return workers[hashString(webshopId) % workers.length];
}

function prefixStream(worker, stream) {
  let pending = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    pending += chunk;
    const lines = pending.split('\n');
    pending = lines.pop();
    lines.forEach((line) => {
      // eslint-disable-next-line no-console
      console.error('[worker ' + worker.index + '] ' + line);
    });
  });
}

function workerIsHealthy(worker) {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: '127.0.0.1', port: worker.port, path: '/health', timeout: 500 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      },
    );
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
  });
}

async function waitUntilHealthy(worker, generation) {
  while (!shuttingDown && worker.generation === generation && worker.child) {
    if (await workerIsHealthy(worker)) {
      if (worker.generation === generation) {
        worker.ready = true;
        worker.backoff = 200;
        // eslint-disable-next-line no-console
        console.error('worker ' + worker.index + ' ready on 127.0.0.1:' + worker.port);
        pump(worker);
      }
      return;
    }
    await sleep(100);
  }
}

function startWorker(worker) {
  const generation = worker.generation + 1;
  worker.generation = generation;
  worker.ready = false;
  const child = spawn(process.execPath, [SERVER_PATH], {
    env: Object.assign({}, process.env, {
      PRERENDER_HOST: '127.0.0.1',
      PRERENDER_PORT: String(worker.port),
      PRERENDER_WORKER_INDEX: String(worker.index),
    }),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  worker.child = child;
  worker.startedAt = Date.now();
  prefixStream(worker, child.stdout);
  prefixStream(worker, child.stderr);
  child.on('exit', (code, signal) => {
    if (worker.generation !== generation) {
      return;
    }
    worker.ready = false;
    worker.child = null;
    worker.inFlight = 0;
    failQueued(worker, new Error('worker ' + worker.index + ' exited'));
    if (shuttingDown) {
      return;
    }
    const fastCrash = Date.now() - worker.startedAt < 1000;
    const delay = fastCrash ? Math.min(5000, worker.backoff * 2) : 200;
    worker.backoff = delay;
    // eslint-disable-next-line no-console
    console.error(
      'worker ' + worker.index + ' exited (' + (signal || code) + '), restarting in ' + delay + 'ms',
    );
    setTimeout(() => {
      if (!shuttingDown && worker.generation === generation) {
        startWorker(worker);
      }
    }, delay);
  });
  waitUntilHealthy(worker, generation);
}

function createWorker(index) {
  const worker = {
    index,
    port: WORKER_PORT_BASE + index,
    queue: [],
    inFlight: 0,
    avgMs: 100,
    ready: false,
    child: null,
    generation: 0,
    backoff: 200,
    startedAt: 0,
  };
  workers.push(worker);
  startWorker(worker);
}

function sendJson(res, status, payload, workerIndex) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  if (workerIndex !== undefined && workerIndex !== null) {
    headers['X-Prerender-Worker'] = String(workerIndex);
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  const pathname = req.url.split('?')[0];
  if (req.method === 'GET' && pathname === '/health') {
    const ready = workers.some((worker) => worker.ready);
    res.writeHead(ready ? 200 : 503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(ready ? 'ok' : 'starting');
    return;
  }

  if (req.method !== 'POST' || pathname !== '/render') {
    res.writeHead(404);
    res.end();
    return;
  }

  try {
    const raw = await readBody(req);
    let payload;
    try {
      payload = JSON.parse(raw.toString('utf8') || '{}');
    } catch {
      sendJson(res, 400, { html: null, error: 'invalid JSON body' });
      return;
    }
    const fragment = typeof payload.html === 'string' ? payload.html : '';
    const worker = chooseWorker(fragment);
    try {
      const result = await enqueue(worker, raw);
      res.writeHead(result.status, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Prerender-Worker': String(worker.index),
      });
      res.end(result.body);
    } catch (error) {
      const status = error && error.status ? error.status : 502;
      sendJson(
        res,
        status,
        { html: null, error: error && error.message ? error.message : String(error) },
        worker.index,
      );
    }
  } catch (error) {
    const status = error && error.status ? error.status : 500;
    sendJson(res, status, {
      html: null,
      error: error && error.message ? error.message : String(error),
    });
  }
});

for (let i = 0; i < WORKER_COUNT; i++) {
  createWorker(i);
}

server.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  shutdown();
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.error(
    'easycredit prerender master on http://' + HOST + ':' + PORT +
    ' workers=' + WORKER_COUNT +
    ' concurrency=' + CONCURRENCY +
    ' budget=' + BUDGET_MS + 'ms',
  );
});

function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  workers.forEach((worker) => {
    worker.ready = false;
    failQueued(worker, new Error('prerender master shutting down'));
    if (worker.child) {
      worker.child.kill('SIGTERM');
    }
  });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

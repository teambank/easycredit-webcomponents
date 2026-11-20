#!/usr/bin/env node
/**
 * Bundle hydrate/index.js for GraalJS: no native Node builtins.
 *
 *   npm run build && npm run build:hydrate-graal
 *
 * Output: hydrate-graal/index.js exposing globalThis.renderToString /
 * globalThis.easycreditHydrate.renderToString
 */

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.join(root, 'hydrate', 'index.js');
const outDir = path.join(root, 'hydrate-graal');
const outfile = path.join(outDir, 'index.js');
const shimDir = path.join(root, 'scripts', 'hydrate-graal-shims');
const globalsShim = fs.readFileSync(path.join(shimDir, 'globals.js'), 'utf8');

if (!fs.existsSync(entry)) {
  console.error('Missing hydrate/index.js. Run npm run build first.');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const shimPlugin = {
  name: 'hydrate-graal-node-shims',
  setup(build) {
    const shims = {
      stream: path.join(shimDir, 'stream.js'),
      url: path.join(shimDir, 'url.js'),
    };
    build.onResolve({ filter: /^(stream|url)$/ }, (args) => {
      const shim = shims[args.path];
      if (!shim) {
        return null;
      }
      return { path: shim };
    });
  },
};

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: 'neutral',
  format: 'iife',
  globalName: 'easycreditHydrate',
  outfile,
  logLevel: 'info',
  plugins: [shimPlugin],
  banner: {
    js: [
      'var module = typeof module === "undefined" ? { exports: {} } : module;',
      'var exports = module.exports;',
      'var process = typeof process !== "undefined" ? process : { env: {}, on: function () {}, platform: "linux" };',
      globalsShim,
      'var AbortController = globalThis.AbortController;',
      'var URL = globalThis.URL;',
      'var URLSearchParams = globalThis.URLSearchParams;',
      'var setTimeout = globalThis.setTimeout;',
      'var clearTimeout = globalThis.clearTimeout;',
      'var setInterval = globalThis.setInterval;',
      'var clearInterval = globalThis.clearInterval;',
      'var queueMicrotask = globalThis.queueMicrotask;',
    ].join('\n'),
  },
  footer: {
    js: [
      'if (typeof globalThis !== "undefined") {',
      '  globalThis.easycreditHydrate = easycreditHydrate;',
      '  if (easycreditHydrate && typeof easycreditHydrate.renderToString === "function") {',
      '    globalThis.renderToString = easycreditHydrate.renderToString.bind(easycreditHydrate);',
      '  }',
      '}',
    ].join('\n'),
  },
});

fs.writeFileSync(
  path.join(outDir, 'README.md'),
  [
    '# hydrate-graal',
    '',
    'Stencil hydrate bundle for GraalJS / JVM embedding.',
    '',
    'Built from `hydrate/index.js` with Node `stream` / `url` shims.',
    'Exposes `globalThis.renderToString` and `globalThis.easycreditHydrate`.',
    '',
    'Rebuild with `npm run build && npm run build:hydrate-graal`.',
    '',
  ].join('\n'),
);

console.log('Wrote', path.relative(root, outfile));

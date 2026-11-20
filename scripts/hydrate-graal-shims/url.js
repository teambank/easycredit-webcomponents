/**
 * Minimal url stub for incidental Node requires inside hydrate.
 */
function pathToFileURL(path) {
  const normalized = String(path || '').replace(/\\/g, '/');
  return { href: 'file://' + (normalized.startsWith('/') ? normalized : '/' + normalized) };
}

module.exports = { pathToFileURL };

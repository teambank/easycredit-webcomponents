/**
 * Minimal stream stub for Stencil hydrate on GraalJS.
 * renderToString(..., asStream=false) never calls Readable.from.
 */
class Readable {
  static from() {
    throw new Error('stream.Readable.from is not supported in the Graal hydrate bundle');
  }
}

module.exports = { Readable };

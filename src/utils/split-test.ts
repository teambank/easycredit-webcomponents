import { getPersistentOptions } from './utils';

function determineVariant() {
  const p = Math.random();
  if (p < 0.33) {
    return 'a';
  }
  if (p > 0.33 && p < 0.66) {
    return 'b';
  }
  return 'c';
}

export function getVariant() {
    let opts = getPersistentOptions({})

    if (!opts.variant) {
        opts = getPersistentOptions({
          variant: determineVariant(),
        })
    }

    return opts.variant
}

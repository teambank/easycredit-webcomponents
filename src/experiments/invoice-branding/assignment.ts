import { getPersistentOptions } from '../../utils/utils';
import { InvoiceBrandingVariant, isInvoiceBrandingVariant } from './variants';

function determineVariant(): InvoiceBrandingVariant {
  const p = Math.random();
  if (p < 0.33) {
    return 'a';
  }
  if (p < 0.66) {
    return 'b';
  }
  return 'c';
}

export function getVariant(): InvoiceBrandingVariant {
  let opts = getPersistentOptions({});

  if (!isInvoiceBrandingVariant(opts.variant)) {
    opts = getPersistentOptions({
      variant: determineVariant(),
    });
  }

  return opts.variant;
}

export function initInvoiceBrandingExperiment(): void {
  getVariant();
}

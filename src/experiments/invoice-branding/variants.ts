export type InvoiceBrandingVariant = 'a' | 'b' | 'c';

export interface InvoiceBranding {
  label: string;
  slogan: string;
  showLogoOnLabel: boolean;
}

const VARIANTS: Record<InvoiceBrandingVariant, InvoiceBranding> = {
  a: {
    label: 'Rechnung',
    slogan: 'mit easyCredit-Rechnung',
    showLogoOnLabel: true,
  },
  b: {
    label: 'Rechnung',
    slogan: 'Jetzt kaufen, in 30 Tagen bezahlen.',
    showLogoOnLabel: false,
  },
  c: {
    label: 'Rechnung',
    slogan: 'Jetzt kaufen, in 30 Tagen bezahlen.',
    showLogoOnLabel: false,
  },
};

export function getBrandingForVariant(variant: InvoiceBrandingVariant): InvoiceBranding {
  return VARIANTS[variant];
}

export function isInvoiceBrandingVariant(variant: unknown): variant is InvoiceBrandingVariant {
  return typeof variant === 'string' && variant in VARIANTS;
}

export function shouldShowCheckoutLogoForVariant(variant: InvoiceBrandingVariant): boolean {
  return variant === 'b';
}

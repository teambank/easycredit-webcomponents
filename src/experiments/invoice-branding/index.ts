import { METHODS } from '../../types';
import { sendFeedback } from '../../utils/utils';
import { initInvoiceBrandingExperiment, getVariant } from './assignment';
import { getBrandingForVariant, shouldShowCheckoutLogoForVariant } from './variants';

export { initInvoiceBrandingExperiment };

export interface InvoiceBrandingDefaults {
  label: string;
  slogan: string;
}

export interface InvoiceBrandingResult extends InvoiceBrandingDefaults {
  showLogoOnLabel: boolean;
}

export function applyInvoiceBranding(
  paymentType: METHODS,
  defaults: InvoiceBrandingDefaults,
): InvoiceBrandingResult {
  if (paymentType !== METHODS.BILL) {
    return { ...defaults, showLogoOnLabel: true };
  }

  const branding = getBrandingForVariant(getVariant());
  return {
    label: branding.label,
    slogan: branding.slogan,
    showLogoOnLabel: branding.showLogoOnLabel,
  };
}

export function shouldShowCheckoutLogo(paymentType: METHODS): boolean {
  if (paymentType !== METHODS.BILL) {
    return false;
  }

  return shouldShowCheckoutLogoForVariant(getVariant());
}

export function trackInvoiceBrandingView(
  callee: object,
  component: 'EasycreditCheckout' | 'EasycreditCheckoutLabel',
  paymentType: METHODS,
): void {
  if (paymentType !== METHODS.BILL) {
    return;
  }

  sendFeedback(callee, {
    component,
    action: 'view',
    paymentType,
  });
}

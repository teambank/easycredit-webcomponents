import { METHODS } from '../types';
import { WebshopInfo } from '../types';

export class Caps {
  paymentTypes: string;
  webshopInfo: WebshopInfo;

  constructor(paymentTypes: string, webshopInfo: WebshopInfo) {
    this.paymentTypes = paymentTypes;
    this.webshopInfo = webshopInfo;
  }

  isEnabled(type): boolean {
    return (
      this.paymentTypes
        .split(',')
        .map(s => s.replace('_PAYMENT', '').trim())
        .includes(type) &&
      (!this.webshopInfo || (this.webshopInfo.billPaymentActive && type === 'BILL') || (this.webshopInfo.installmentPaymentActive && type === 'INSTALLMENT'))
    );
  }

  validateAmount(amount: number, method: METHODS) {
    const info = this.webshopInfo
    if (!info) {
        return
    }

    if (method === METHODS.INSTALLMENT) {
        if (
            amount < info.minInstallmentValue ||
            amount > info.maxInstallmentValue
        ) {
            throw new Error(`Der Finanzierungbetrag liegt außerhalb der zulässigen Beträge (${info.minFinancingAmount} € - ${info.maxFinancingAmount} €)`)
        }
    } else if (method === METHODS.BILL) {
        if (
            amount < info.minBillingValue ||
            amount > info.maxBillingValue
        ) {
            throw new Error(`Der Bestellwert liegt außerhalb der zulässigen Beträge (${info.minBillingValue} € - ${info.maxBillingValue} €)`)
        }
    }
  }
}

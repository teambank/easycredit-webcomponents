import state from '../stores/general';
import { METHODS } from '../types';

export class Caps {
  paymentTypes: string;
 
  constructor(paymentTypes: string) {
    this.paymentTypes = paymentTypes;
  }
 
  isEnabled(type): boolean {
    return this.paymentTypes.split(',').map(s => s.replace('_PAYMENT', '').trim()).includes(type)
        && (!state.webshopInfo || (
        (state.webshopInfo.billPaymentActive && type === 'BILL') ||
        (state.webshopInfo.installmentPaymentActive && type === 'INSTALLMENT')
        ))
  }
}

export function validateAmount(amount: number, method: METHODS) {
    const info = state.webshopInfo
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
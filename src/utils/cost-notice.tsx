import { h } from '@stencil/core';

const INSTALLMENT_COST_NOTICE = 'Achtung! Durch Ratenzahlung entstehen Kosten.';
const BILL_COST_NOTICE = 'Durch Zahlungsverzug können Kosten entstehen.';

export function installmentCostNotice(): string {
  return INSTALLMENT_COST_NOTICE;
}

export function billCostNotice(): string {
  return BILL_COST_NOTICE;
}

export function CostNotice(props: { text?: string; slot?: string }) {
  return (
    <p class="ec-cost-notice" slot={props.slot}>
      {props.text ?? installmentCostNotice()}
    </p>
  );
}

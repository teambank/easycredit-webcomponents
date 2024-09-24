import { Component, Prop, h } from '@stencil/core';
import { applyAssetsUrl } from '../../utils/utils';
import { METHODS } from '../../types';

@Component({
  tag: 'easycredit-checkout-label',
  styleUrl: 'easycredit-checkout-label.scss',
  shadow: true,
})

export class EasycreditCheckoutLabel {

  @Prop({ mutable: true }) label: string
  @Prop({ mutable: true }) slogan: string
  @Prop({ mutable: true}) paymentType: METHODS = METHODS.INSTALLMENT

  connectedCallback() {
    applyAssetsUrl(EasycreditCheckoutLabel)
  }

  componentWillLoad() {
    if (this.paymentType === METHODS.INSTALLMENT) {
      this.label ??= 'easyCredit-Ratenkauf'
      this.slogan ??= 'Ganz entspannt in Raten zahlen.'
    } else if (this.paymentType === METHODS.BILL) {
      this.label ??= 'easyCredit-Rechnung'
      this.slogan ??= 'Erst kaufen, in 30 Tagen bezahlen.'
    }
  }

  render() { 

    return ([
      <div class="ec-checkout-label-container">
        <div class="ec-checkout-label">
          <strong>{this.label}</strong><br />
          <small>{this.slogan}</small>

          <div class={{
            'ec-checkout-label__logo' : true,
            'ec-checkout-label__logo-installment': this.paymentType ===  METHODS.INSTALLMENT,
            'ec-checkout-label__logo-bill': this.paymentType === METHODS.BILL
          }}></div>
        </div>
      </div>
    ])
  }
}

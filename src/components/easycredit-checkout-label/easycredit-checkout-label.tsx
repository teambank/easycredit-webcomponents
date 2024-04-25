import { Component, Prop, h } from '@stencil/core';
import { applyAssetsUrl } from '../../utils/utils';

@Component({
  tag: 'easycredit-checkout-label',
  styleUrl: 'easycredit-checkout-label.scss',
  shadow: true,
})

export class EasycreditCheckoutLabel {

  @Prop({ mutable: true }) label: string
  @Prop({ mutable: true }) slogan: string
  @Prop({ mutable: true}) method: string = "INSTALLMENT_PAYMENT";

  connectedCallback() {
    applyAssetsUrl(EasycreditCheckoutLabel)
  }

  componentWillLoad() {
    if (this.method === 'INSTALLMENT_PAYMENT') {
      this.label ??= 'easyCredit-Ratenkauf'
      this.slogan ??= 'Ganz entspannt in Raten zahlen.'
    } else if (this.method === 'BILL_PAYMENT') {
      this.label ??= 'easyCredit-Rechnung'
      this.slogan ??= 'Jetzt kaufen, in 30 Tagen bezahlen.'
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
            'ec-checkout-label__logo-installment': this.method === 'INSTALLMENT_PAYMENT',
            'ec-checkout-label__logo-bill': this.method === 'BILL_PAYMENT'
          }}></div>
        </div>
      </div>
    ])
  }
}

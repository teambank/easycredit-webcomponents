import { Component, Prop, h } from '@stencil/core';
import { applyAssetsUrl } from '../../utils/utils';

@Component({
  tag: 'easycredit-checkout-label',
  styleUrl: 'easycredit-checkout-label.scss',
  shadow: true,
})

export class EasycreditCheckoutLabel {

  @Prop({ mutable: true }) label: string = 'easyCredit-Ratenkauf';
  @Prop({ mutable: true }) slogan: string = 'Ganz entspannt in Raten zahlen.';

  connectedCallback() {
    applyAssetsUrl(EasycreditCheckoutLabel)
  }

  render() { 

    return ([
      <div class="ec-checkout-label-container">
        <div class="ec-checkout-label">
          <strong>{this.label}</strong><br />
          <small>{this.slogan}</small>

          <div class="ec-checkout-label__logo"></div>
        </div>
      </div>
    ])
  }
}

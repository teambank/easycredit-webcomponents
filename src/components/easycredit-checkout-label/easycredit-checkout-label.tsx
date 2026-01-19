import { Component, Prop, State, h } from '@stencil/core';
import { applyAssetsUrl, sendFeedback } from '../../utils/utils';
import { getVariant } from '../../utils/split-test';
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

  @State() showLogo: boolean = true;

  private viewEventSent: boolean = false;

  connectedCallback() {
    applyAssetsUrl(EasycreditCheckoutLabel)
  }

  componentWillLoad() {
    if (this.paymentType === METHODS.INSTALLMENT) {
      this.label ??= 'easyCredit-Ratenkauf'
      this.slogan ??= 'Ganz entspannt in Raten zahlen.'
    } else if (this.paymentType === METHODS.BILL) {
      this.label ??= 'Rechnung'
      this.slogan ??= 'Jetzt kaufen, in 30 Tagen bezahlen.'
    }

    this.applyAbTestVariant();
  }

  async componentDidRender() {
    if (this.paymentType !== METHODS.BILL) {
      return
    }

    // Track view event only once per initialization
    if (!this.viewEventSent) {
      this.viewEventSent = true;
      sendFeedback(this, { 
        component: 'EasycreditCheckoutLabel', 
        action: 'view',
        paymentType: this.paymentType
      });
    }
  }

  applyAbTestVariant() {
    if (this.paymentType !== METHODS.BILL) {
      return
    }

    // force overwrite label and slogan only for bill payment type
    const variant = getVariant();
    switch (variant) {
      case 'a':
        this.label = 'Rechnung'
        this.slogan = 'mit easyCredit-Rechnung'
        break
      case 'b':
      case 'c':
        this.label = 'Rechnung'
        this.slogan = 'Jetzt kaufen, in 30 Tagen bezahlen.'
        this.showLogo = false;
        break
    }
  }

  render() { 

    return ([
      <div class="ec-checkout-label-container">
        <div class={{
          'ec-checkout-label': true,
          'ec-checkout-label--no-logo': !this.showLogo
        }}>
          <strong>{this.label}</strong><br />
          <small>{this.slogan}</small>

          {this.showLogo && (
            <div class={{
              'ec-checkout-label__logo' : true,
              'ec-checkout-label__logo-installment': this.paymentType ===  METHODS.INSTALLMENT,
              'ec-checkout-label__logo-bill': this.paymentType === METHODS.BILL
            }}></div>
          )}
        </div>
      </div>
    ])
  }
}

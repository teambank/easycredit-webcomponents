import { Component, Prop, State, h } from '@stencil/core';
import { applyAssetsUrl } from '../../utils/utils';
import { applyInvoiceBranding, trackInvoiceBrandingView } from '../../experiments/invoice-branding';
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

    const branding = applyInvoiceBranding(this.paymentType, {
      label: this.label,
      slogan: this.slogan,
    });
    this.label = branding.label;
    this.slogan = branding.slogan;
    this.showLogo = branding.showLogoOnLabel;
  }

  async componentDidRender() {
    if (this.viewEventSent) {
      return;
    }

    this.viewEventSent = true;
    trackInvoiceBrandingView(this, 'EasycreditCheckoutLabel', this.paymentType);
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

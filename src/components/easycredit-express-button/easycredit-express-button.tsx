import { Component, Prop, h, State, Listen, Element, Watch } from '@stencil/core'
import { fetchInstallmentPlans,validateInstallmentPlans, getWebshopInfo, sendFeedback, addErrorHandler } from '../../utils/utils'
import { Caps } from '../../utils/validation';
import { InstallmentPlan, InstallmentPlans, METHODS } from '../../types';
import { WebshopInfo } from '../../types';

@Component({
  tag: 'easycredit-express-button',
  styleUrl: 'easycredit-express-button.scss',
  shadow: true,
})
export class EasycreditExpressButton {
  @Prop() webshopId: string;
  @Prop({ mutable: true }) amount: number;
  @Prop({ mutable: true }) paymentTypes: string;
  @Prop() fullWidth: boolean = false;
  @Prop() redirectUrl: string;

  @State() buttonWidth: string = '100%';
  @State() selectedPaymentType: METHODS;
  @State() installmentPlans: InstallmentPlans = null;
  @State() selectedInstallment: InstallmentPlan = null;
  @State() paymentTypesEmpty: boolean = false;
  @State() webshopInfo: WebshopInfo = null;
  @State() agreementInView: boolean = false;

  infopageModal!: HTMLEasycreditModalElement;
  checkoutModal!: HTMLEasycreditModalElement;
  paymentModal!: HTMLEasycreditModalElement;

  @Element() el: HTMLElement;

  caps: Caps;

  @Listen('selectedInstallment', { target: 'window' })
  selectedInstallmentHandler(e) {
    this.selectedInstallment = this.installmentPlans.plans.find(i => i.numberOfInstallments == e.detail);
  }

  @Listen('openModal')
  openModalHandler() {
    this.checkoutModal.open();

    setTimeout(() => {
      const container = this.checkoutModal?.querySelector('.checkout-modal-wrapper');
      if (container) {
        container.addEventListener('scroll', () => {
          this.agreementInView = container.scrollTop >= 150;
        });
      } else {
        console.warn('Scroll container not found');
      }
    }, 100);

    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'openCheckoutModal' });
  }

  @Watch('amount')
  async onAmountChanged(amount: number, oldAmount: number) {
    if (!amount) {
      this.installmentPlans = null;
      return;
    }
    if (amount !== oldAmount && amount > 0) {
      try {
        const installmentPlans = await fetchInstallmentPlans(this.webshopId, this.amount);
        this.installmentPlans = validateInstallmentPlans(installmentPlans);
      } catch (e) {
        this.installmentPlans = null;
        console.error(e);
      }
    }
  }

  openInfopageModal() {
    this.infopageModal.open();
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'openInfopageModal' });
  }

  isEnabled(type: METHODS) {
    return this.caps.isEnabled(type);
  }

  isValid(type: METHODS) {
    let valid;
    try {
      this.caps.validateAmount(this.amount, type);
      valid = true;
    } catch (e) {
      valid = false;
    }
    return this.isEnabled(type) && valid;
  }

  async componentWillLoad() {
    if (!this.paymentTypes) {
      this.paymentTypes = METHODS.INSTALLMENT;
      this.paymentTypesEmpty = true;
    }

    try {
      this.webshopInfo = await getWebshopInfo(this.webshopId);
      this.caps = new Caps(this.paymentTypes, this.webshopInfo);
    } catch (errorMessage) {
      let alert = errorMessage ?? 'Es ist ein Fehler aufgetreten.';
      console.error(alert);
    }

    this.onAmountChanged(this.amount, null);
  }

  getInstallmentUspFragment() {
    return [
      <div class="ec-checkout__body">
        <div class="h4">Ihre Vorteile</div>
        <ul class="ec-usp">
          <li>
            Frühestens <strong>30 Tage</strong> nach Lieferung zahlen
          </li>
          <li>Flexible monatliche Wunschrate</li>
          <li>Kostenfreie Ratenanpassung & Sondertilgung</li>
        </ul>
      </div>,
    ];
  }

  getCheckoutModalFragment() {
    return [
      <easycredit-modal
        class={{ 'ec-express-button__modal__checkout': true }}
        ref={el => (this.checkoutModal = el as HTMLEasycreditModalElement)}
        onModalSubmit={() => this.modalSubmitHandler()}
        size="checkout"
      >
        <div slot="content">
          <div
            class={{ 'checkout-modal-wrapper': true, 'ec-row': true, 'scrolled': this.agreementInView }}
            >
            <div class="ec-col ec-col-method">
              <div class="ec-container">
                <easycredit-logo payment-type={this.selectedPaymentType} color="white"></easycredit-logo>

                {this.isValid(METHODS.INSTALLMENT) && this.isValid(METHODS.BILL) && (
                  <div class="ec-switch">
                    <button onClick={() => this.switchPaymentType(METHODS.INSTALLMENT)} class={{ active: this.selectedPaymentType === METHODS.INSTALLMENT }}>
                      Ratenkauf
                    </button>
                    <button onClick={() => this.switchPaymentType(METHODS.BILL)} class={{ active: this.selectedPaymentType === METHODS.BILL }}>
                      Rechnungskauf
                    </button>
                  </div>
                )}

                {!this.paymentTypesEmpty && (
                  <div class="skip-link-container"><a class="skip-link btn btn-primary" onClick={() => this.scrollToAgreement()}>
                    {this.selectedPaymentType === METHODS.INSTALLMENT && <span>Weiter zum Ratenkauf</span>}
                    {this.selectedPaymentType === METHODS.BILL && <span>Weiter zum Rechnungskauf</span>}
                  </a></div>
                )}

                {this.selectedPaymentType === METHODS.INSTALLMENT && !this.paymentTypesEmpty && (
                  <easycredit-checkout-installments installments={JSON.stringify(this.installmentPlans.plans)} rows={3} />
                )}
                {this.selectedPaymentType === METHODS.BILL &&
                  <easycredit-checkout-bill-payment-timeline></easycredit-checkout-bill-payment-timeline>
                }
                {!this.paymentTypesEmpty && (
                  <easycredit-checkout-totals
                    amount={this.amount}
                    selectedInstallment={this.selectedInstallment}
                    installmentPlans={this.installmentPlans}
                  ></easycredit-checkout-totals>
                )}

                {this.paymentTypesEmpty && this.getInstallmentUspFragment()}
              </div>

              <div class="ec-background">
                <div class="ec-circle"></div>
                <div class="ec-circle ec-circle-secondary"></div>
              </div>
            </div>

            <div class="ec-col ec-col-agreement" id="agreement">
              <div class="ec-container">
                {this.selectedPaymentType === METHODS.INSTALLMENT && <span slot="heading">Weiter zum Ratenkauf</span>}
                {this.selectedPaymentType === METHODS.BILL && <span slot="heading">Weiter zum Rechnungskauf</span>}

                <p>
                  <strong>Mit Klick auf Akzeptieren stimmen Sie der Datenübermittlung zu:</strong>
                </p>
                <easycredit-checkout-privacy-approval webshop-id={this.webshopId} />
              </div>
            </div>
          </div>
        </div>
        <span slot="button">Akzeptieren</span>
      </easycredit-modal>,
    ];
  }

  modalSubmitHandler() {
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'submit' });
    if (this.redirectUrl) {
      this.paymentModal.open();
      this.checkoutModal.close();
    } else {
      addErrorHandler(this, () => {
        alert('Leider ist eine Zahlung mit easyCredit derzeit nicht möglich. Bitte verwenden Sie eine andere Zahlungsart oder wenden Sie sich an den Händler.');
        this.checkoutModal.close();
      });

      const eventParams = {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
          paymentType: this.selectedPaymentType,
          ...(this.selectedInstallment?.numberOfInstallments && { numberOfInstallments: this.selectedInstallment?.numberOfInstallments }),
        },
      };

      this.el.dispatchEvent(new CustomEvent('submit', eventParams)); // deprecated, bubbles only until form when using event delegation, kept for backwards compat
      this.el.dispatchEvent(new CustomEvent('easycredit-submit', eventParams));
    }
  }

  getPaymentModalFragment() {
    if (!this.redirectUrl) {
      return;
    }

    return [
      <easycredit-modal class={{ 'ec-express-button__modal__payment': true }} ref={el => (this.paymentModal = el as HTMLEasycreditModalElement)} size="full">
        <iframe src={this.redirectUrl} slot="content" class="iframe-full"></iframe>
      </easycredit-modal>,
    ];
  }

  clickHandler = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.detail !== this.selectedPaymentType) {
      this.switchPaymentType(event.detail as METHODS);
    }
    this.checkoutModal.open();
    this.el.dispatchEvent(new CustomEvent('openModal', { bubbles: true, composed: true }));
  };

  switchPaymentType(paymentType: METHODS) {
    this.selectedPaymentType = paymentType;
    this.selectedInstallment = null;
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'switchPaymentType', paymentType: this.selectedPaymentType });
  }

  scrollToAgreement() {
    const element = this.checkoutModal.querySelector<HTMLElement>('.ec-col-agreement .ec-container');
    element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });    
  }

  render() {
    if (!this.isValid(METHODS.INSTALLMENT) && !this.isValid(METHODS.BILL)) {
      return;
    }
    return [
      <div class="ec-express-button">
        {this.isValid(METHODS.INSTALLMENT) && (
          <easycredit-express-button-single
            onButtonClicked={this.clickHandler.bind(this)}
            payment-type={METHODS.INSTALLMENT}
            webshop-id={this.webshopId}
            amount={this.amount}
            full-width={this.fullWidth}
          ></easycredit-express-button-single>
        )}
        {this.isValid(METHODS.BILL) && (
          <easycredit-express-button-single
            onButtonClicked={this.clickHandler.bind(this)}
            payment-type={METHODS.BILL}
            webshop-id={this.webshopId}
            amount={this.amount}
            full-width={this.fullWidth}
          ></easycredit-express-button-single>
        )}

        <a class="ec-express-button__link" target="_blank" style={{ width: this.buttonWidth }} onClick={() => this.openInfopageModal()}>
          <div class="icon"></div>
          <div>
            Mehr zum <strong>Bezahlen mit easyCredit</strong>
          </div>
        </a>

        {this.getCheckoutModalFragment()}
        {this.getPaymentModalFragment()}

        <easycredit-modal class={{ 'ec-express-button__modal__infopage': true }} ref={el => (this.infopageModal = el as HTMLEasycreditModalElement)} size="infopage">
          <easycredit-infopage slot="content" />
        </easycredit-modal>
      </div>,
    ];
  }
}

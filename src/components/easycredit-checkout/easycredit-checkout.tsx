import { Component, Prop, State, Listen, Element, Watch, h } from '@stencil/core';
import { formatCurrency, fetchInstallmentPlans, validateInstallmentPlans, getWebshopInfo, sendFeedback, addErrorHandler } from '../../utils/utils';
import { Caps } from '../../utils/validation';
import { InstallmentPlan, InstallmentPlans, METHODS } from '../../types';
import { WebshopInfo } from '../../types';

@Component({
  tag: 'easycredit-checkout',
  styleUrl: 'easycredit-checkout.scss',
  shadow: true,
})
export class EasycreditCheckout {
  @Prop() isActive: boolean = true;
  @Prop({ mutable: true }) amount: number;
  @Prop() webshopId: string;
  @Prop() alert: string;
  @Prop() paymentPlan: string;
  @Prop() paymentType: METHODS = METHODS.INSTALLMENT;
  @Prop() disableFlexprice: boolean = false;
  @Prop() noInteraction: boolean = false;

  @State() isInitialized: boolean = false;
  @State() submitButtonClicked: boolean = false;
  @State() installmentPlans: InstallmentPlans = null;
  @State() selectedInstallment: InstallmentPlan = null;
  @State() submitDisabled = false;
  @State() webshopInfo: WebshopInfo = null;

  @Element() el: HTMLElement;

  modal!: HTMLEasycreditModalElement;

  caps: Caps;
  errorHandlerTimeout: number;

  @Listen('selectedInstallment')
  selectedInstallmentHandler(e) {
    this.selectedInstallment = this.installmentPlans.plans.find(i => i.numberOfInstallments == e.detail);
  }

  @Listen('openModal')
  openModalHandler() {
    this.modal.open();
  }

  @Listen('closeModal')
  closeModalHandler() {
    this.modal.close();
    clearTimeout(this.errorHandlerTimeout);
  }

  isEnabled(type: METHODS) {
    return this.caps.isEnabled(type);
  }

  async componentWillLoad() {
    this.webshopInfo = await getWebshopInfo(this.webshopId);
    this.caps = new Caps(this.paymentType, this.webshopInfo);

    if (this.amount > 0 && !this.alert && !this.paymentPlan) {
      try {
        this.caps.validateAmount(this.amount, this.paymentType);

        if (this.isEnabled(METHODS.INSTALLMENT)) {
          const opts = this.disableFlexprice ? { withoutFlexprice: this.disableFlexprice } : null;
          const installmentPlans = await fetchInstallmentPlans(this.webshopId, this.amount, opts);
          this.installmentPlans = validateInstallmentPlans(installmentPlans);
        }
      } catch (error) {
        this.alert = error.message ?? 'Es ist ein Fehler aufgetreten.';
      }
    }
    this.isInitialized = true;
  }

  @Watch('amount') watchAmountHandler() {
    if (!this.caps) {
      return; // watch only after initialization
    }

    try {
      this.caps.validateAmount(this.amount, this.paymentType);
    } catch (error) {
      this.alert = error.message ?? 'Es ist ein Fehler aufgetreten.';
    }
  }

  submitHandler() {
    sendFeedback(this, { component: 'EasycreditCheckout', action: 'submit' });

    this.submitButtonClicked = true;
    this.errorHandlerTimeout = addErrorHandler(this, () => {
      this.alert = 'Leider ist eine Zahlung mit easyCredit derzeit nicht möglich. Bitte verwenden Sie eine andere Zahlungsart oder wenden Sie sich an den Händler.';
      this.modal.close();
    });

    const eventParams = {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        paymentType: this.paymentType,
        numberOfInstallments: this.selectedInstallment?.numberOfInstallments ?? null,
      },
    };

    this.el.dispatchEvent(new CustomEvent('submit', eventParams)); // deprecated, bubbles only until form when using event delegation, kept for backwards compat
    this.el.dispatchEvent(new CustomEvent('easycredit-submit', eventParams));
  }

  getPaymentPlan() {
    if (this.alert) {
      return false;
    }

    try {
      if (this.paymentPlan) {
        return JSON.parse(this.paymentPlan);
      }
    } catch (e) {
      console.error(e);
      this.alert = 'Es ist ein Fehler aufgetreten.';
    }

    return false;
  }

  getInstallmentPaymentPlanFragment() {
    if (!this.getPaymentPlan()) {
      return null;
    }

    return (
      <div class="ec-payment-plan">
        <strong>Ihre Auswahl:</strong>
        <ul class="ec-checkout__instalments payment-plan">
          <li class="is-selected">
            <label>
              <span>{this.getPaymentPlan().numberOfInstallments} Raten</span>
              <span>à {formatCurrency(this.getPaymentPlan().installment)}</span>
            </label>
          </li>
        </ul>
        <p class="ec-checkout__small-print">
          <small>
            Die Raten im Detail:&nbsp;
            {this.getPaymentPlan().numberOfInstallments - 1} x {formatCurrency(this.getPaymentPlan().installment)}, 1 x {formatCurrency(this.getPaymentPlan().lastInstallment)}
          </small>
        </p>
      </div>
    );
  }

  getBillPaymentPlanFragment() {
    if (!this.getPaymentPlan()) {
      return null;
    }
    return [
      <easycredit-checkout-totals amount={this.getPaymentPlan().orderValue}>
        <div slot="actions"></div>
      </easycredit-checkout-totals>
    ];
  }

  getCheckoutInstallmentFragment() {
    if (this.alert) {
      return;
    }

    return [
      <div class="ec-checkout__body">
        <easycredit-checkout-installments installments={JSON.stringify(this.installmentPlans.plans)} />
        <easycredit-checkout-totals amount={this.amount} selectedInstallment={this.selectedInstallment} installmentPlans={this.installmentPlans}>
          <div slot="actions">
            <div class="ec-checkout__actions form-submit">
              <button type="button" class="btn btn-primary" onClick={() => this.modal.open()}>
                Weiter zum Ratenkauf
              </button>
            </div>
          </div>
        </easycredit-checkout-totals>
      </div>,
    ];
  }

  getCheckoutInstallmentUspFragment() {
    if (this.alert) {
      return;
    }

    return [
      <div class="ec-checkout__body">
        <div class="h4">Ihre Vorteile</div>
        <ul class="ec-checkout__usp">
          <li>
            Frühestens <strong>30 Tage</strong> nach Lieferung zahlen
          </li>
          <li>Flexible monatliche Wunschrate</li>
          <li>Kostenfreie Ratenanpassung & Sondertilgung</li>
        </ul>

        {
            this.noInteraction ||
            <div class="ec-checkout__actions form-submit">
              <button
                type="button"
                class={{ 'btn': true, 'btn-primary': true, 'loading': this.submitButtonClicked }}
                disabled={this.submitButtonClicked}
                onClick={() => this.submitHandler()}
              >
                Weiter zu easyCredit-Ratenkauf
              </button>
            </div>
        }

        <p class="ec-checkout__small-print">{this.getPrivacyFragment({ intro: false })}</p>
      </div>,
    ];
  }

  getCheckoutBillPaymentFragment() {
    if (this.alert) {
      return;
    }

    return [
      <div class="ec-checkout__body">
        <div class="h4">Ihre Vorteile</div>
        <ul class="ec-checkout__usp">
          <li>
            Frühestens <strong>30 Tage</strong> nach Lieferung zahlen
          </li>
          <li>Keine zusätzlichen Kosten</li>
        </ul>

        <easycredit-checkout-totals amount={this.amount}>
          <div slot="actions"></div>
        </easycredit-checkout-totals>

        {
            this.noInteraction ||
            <div class="ec-checkout__actions form-submit">
              <button
                type="button"
                class={{ 'btn': true, 'btn-primary': true, 'loading': this.submitButtonClicked }}
                disabled={this.submitButtonClicked}
                onClick={() => this.submitHandler()}
              >
                auf Rechnung zahlen
              </button>
            </div>
        }
        <p class="ec-checkout__small-print">{this.getPrivacyFragment({ intro: false })}</p>
      </div>,
    ];
  }

  getPrivacyFragment({ intro = true }) {
    const html = (
      <div class="privacy">
        {intro && (
          <p>
            <strong>Mit Klick auf Akzeptieren stimmen Sie der Datenübermittlung zu:</strong>
          </p>
        )}
        <div class="form-check">
          <label class="form-check-label" htmlFor="modalAgreement">
            <small>{this.webshopInfo?.privacyApprovalForm}</small>
          </label>
        </div>
      </div>
    );
    return html;
  }

  getModalFragment() {
    return [
      <easycredit-modal
        ref={el => (this.modal = el as HTMLEasycreditModalElement)}
        onModalClosed={() => (this.submitButtonClicked = false)}
        onModalSubmit={() => this.submitHandler()}
      >
        <div slot="heading">Weiter zum Ratenkauf</div>
        <div slot="content">{this.getPrivacyFragment({})}</div>
        <span slot="button">Akzeptieren</span>
      </easycredit-modal>,
    ];
  }

  render() {
    if (!this.isInitialized || !this.isActive) {
      return null;
    }

    return [
      <div class="ec-checkout-container">
        <div class="ec-checkout">
          {this.isEnabled(METHODS.INSTALLMENT) && this.getPaymentPlan() && this.getInstallmentPaymentPlanFragment()}
          {this.isEnabled(METHODS.BILL) && this.getPaymentPlan() && this.getBillPaymentPlanFragment()}

          {!this.getPaymentPlan() && (
            <div class="ec-checkout-wrapper">
              {this.alert && <div class="ec-checkout__alert">{this.alert}</div>}
              {this.isEnabled(METHODS.INSTALLMENT) && this.getCheckoutInstallmentUspFragment()}
              {this.isEnabled(METHODS.BILL) && this.getCheckoutBillPaymentFragment()}
              {!this.isEnabled(METHODS.INSTALLMENT) && !this.isEnabled(METHODS.BILL) && <div class="ec-checkout__alert">Die gewählte Zahlungsart ist derzeit nicht verfügbar.</div>}
            </div>
          )}
        </div>
        {this.getModalFragment()}
      </div>,
    ];
  }
}

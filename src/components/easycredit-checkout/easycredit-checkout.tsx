import { Component, Prop, State, Listen, Element, Watch, h } from '@stencil/core';
import { formatCurrency, fetchInstallmentPlans, fetchSingleInstallmentPlan, fetchAgreement, sendFeedback, addErrorHandler } from '../../utils/utils';

enum METHODS {
  INSTALLMENT_PAYMENT = 'INSTALLMENT_PAYMENT',
  BILL_PAYMENT = 'BILL_PAYMENT'
}

type WebshopInfo = {
  availability: boolean,
  billPaymentActive: boolean,
  declarationOfConsent: string,
  flexprice: boolean,
  illustrativeExample: string,
  installmentPaymentActive: boolean
  interestRate: number,
  maxBillingValue: number,
  maxFinancingAmount: number,
  maxInstallmentValue: number,
  minBillingValue: number,
  minFinancingAmount: number,
  minInstallmentValue: number,
  privacyApprovalForm: string,
  productDetails: string,
  testMode: boolean
};

@Component({
  tag: 'easycredit-checkout',
  styleUrl: 'easycredit-checkout.scss',
  shadow: true,
})

export class EasycreditCheckout {

  @Prop() isActive: boolean = true
  @Prop({ mutable: true }) amount: number
  @Prop() webshopId: string
  @Prop() alert: string
  @Prop() paymentPlan: string
  @Prop() method: string = METHODS.INSTALLMENT_PAYMENT

  /**
   * Disable Flexprice in calculation
   */
  @Prop() disableFlexprice: boolean = false

  @State() submitButtonClicked: boolean = false

  @State() totals = {
    interest: 0,
    total: 0
  }
  @State() installments
  @State() selectedInstallment = {
    totalInterest: 0,
    totalValue: 0,
    numberOfInstallments: 0
  }
  @State() example
  @State() submitDisabled = false
  @State() webshopInfo: WebshopInfo = null

  modal!: HTMLEasycreditModalElement;

  @Listen('selectedInstallment')
  selectedInstallmentHandler(e) {
    this.selectedInstallment = this.installments.find(i => i.numberOfInstallments == e.detail)
  }

  @Listen('openModal')
  openModalHandler () {
    this.modal.open()
  }

  @Listen('closeModal')
  closeModalHandler () {
    this.modal.close()
  }

  async componentWillLoad () {
    if (this.amount > 0 && !this.alert && !this.paymentPlan) {

      const fetchPlans = (this.disableFlexprice) ?
        fetchSingleInstallmentPlan.bind(this, this.webshopId, this.amount, { 'withoutFlexprice': true }) :
        fetchInstallmentPlans.bind(this, this.webshopId, this.amount)

      await fetchPlans().then((data) => {
        if (!data) {
          return
        }
        const installment = data.installmentPlans.find(() => true)
        if (installment.errors) {
          this.alert = installment.errors.violations.find(()=>true).message
          if (installment.errors.title === 'INVALID_PRICE') {
            this.alert = `Der Finanzierungbetrag liegt außerhalb der zulässigen Beträge (${data.minFinancingAmount} € - ${data.maxFinancingAmount} €)`
          }
          return
        }

        this.installments = installment.plans.reverse()
        this.example = installment.example
      }).catch(e => {
        console.error(e)
      })

      /* if (this.alert) {
        return
      } */

      fetchAgreement(this.webshopId).then(data => {
        this.webshopInfo = data
        this.validateAmount()

      }).catch(e => {
        console.error(e)
        this.alert = 'Es ist ein Fehler aufgetreten.'
      })
    }
  }

  @Watch('amount') watchAmountHandler() {
    this.validateAmount()
  }

  validateAmount () {
    const info = this.webshopInfo
    if (!info) {
      return
    }

    if (this.method === METHODS.INSTALLMENT_PAYMENT) {
       if (
          this.amount < info.minInstallmentValue ||
          this.amount > info.maxInstallmentValue
        ) {
          this.alert = `Der Finanzierungbetrag liegt außerhalb der zulässigen Beträge (${info.minFinancingAmount} € - ${info.maxFinancingAmount} €)`
          return
       }
    } else if (this.method === METHODS.BILL_PAYMENT) {
      if (
        this.amount < info.minBillingValue ||
        this.amount > info.maxBillingValue
      ) {
          this.alert = `Der Bestellwert liegt außerhalb der zulässigen Beträge (${info.minBillingValue} € - ${info.maxBillingValue} €)`
          return
       }
    }
    this.alert = null
  }

  @Element() el: HTMLElement;

  submitHandler() {
    sendFeedback(this, { component: 'EasycreditCheckout', action: 'submit' })
    this.acceptButtonClicked = true

    addErrorHandler(this, () => {
      this.alert = 'Leider ist eine Zahlung mit easyCredit derzeit nicht möglich. Bitte verwenden Sie eine andere Zahlungsart oder wenden Sie sich an den Händler.'
      this.modal.close()
    })

    this.el.dispatchEvent(new CustomEvent('submit', {
      bubbles    : true,
      cancelable : true,
      composed: true,
      detail: {
        numberOfInstallments: this.selectedInstallment.numberOfInstallments
      }
    }))
  }

  getPaymentPlan () {
    if (this.alert) {
      return false
    }

    try {
      if (this.paymentPlan) {
        return JSON.parse(this.paymentPlan)
      }
    } catch (e) {
      console.error(e)
      this.alert = 'Es ist ein Fehler aufgetreten.'
    }

    return false
  }

  getPaymentPlanFragment () {
    if (!this.getPaymentPlan()) {
      return null
    }

    return <div class="ec-payment-plan">
      <strong>Ihre Auswahl:</strong>
      <ul class="ec-checkout__instalments payment-plan">
          <li class="is-selected">
            <label>
                <span>{ this.getPaymentPlan().numberOfInstallments } Raten</span>
                <span>à { formatCurrency(this.getPaymentPlan().installment) }</span>
            </label>
          </li>
      </ul>
      <p class="ec-checkout__small-print">
          <small>Die Raten im Detail:&nbsp;
          { this.getPaymentPlan().numberOfInstallments - 1 } x { formatCurrency(this.getPaymentPlan().installment) }, 1 x { formatCurrency(this.getPaymentPlan().lastInstallment) }
          </small>
      </p>
    </div>
  }

  getCheckoutInstallmentFragment () {
    if (this.alert) {
      return
    }

    return ([<div class="ec-checkout__body">
        <easycredit-checkout-installments installments={JSON.stringify(this.installments)} /* v-model="selectedInstalment" :instalments="instalments" */ />

        <ul class="ec-checkout__totals">
        <li>
            <span>Kaufbetrag</span>
            <span>{  formatCurrency(this.amount) }</span>
        </li>
        <li>
            <span>+ Zinsen</span>
            <span>{  formatCurrency(this.selectedInstallment.totalInterest) }</span>
        </li>
        <li class="total">
            <span>Gesamtbetrag</span>
            <span>{ formatCurrency(this.selectedInstallment.totalValue) }</span>
        </li>
        </ul>

        <div class="ec-checkout__actions form-submit">
          <button type="button" class="btn btn-primary" onClick={() => this.modal.open()}>
              Weiter zum Ratenkauf
          </button>
        </div>

        <p class="ec-checkout__small-print">
          <small innerHTML={this.example} />
        </p>
      </div>
    ])
  }

  getCheckoutBillPaymentFragment () {
    if (this.alert) {
      return
    }

    return ([<div class="ec-checkout__body">
        <div class="ec-checkout__timeline">
          <div class="ec-checkout__animation-information">
            <span>Heute<br />bestellen</span>
            <span>in <strong>30 Tagen</strong><br />bezahlen</span>
          </div>

          <div class="ec-checkout__animation">
            <span class="ec-checkout__animation-start"></span>
            <span class="ec-checkout__animation-bullets">
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '0' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '1' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '2' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '3' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '4' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '5' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '6' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '7' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '8' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '9' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '10' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '11' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '12' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '13' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '14' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '15' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '16' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '17' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '18' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '19' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '20' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '21' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '22' }}></span>
              <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '23' }}></span>
            </span>
            <span class="ec-checkout__animation-end"></span>
          </div>

          <div class="ec-checkout__information">
            <div class="icon"></div> Ihre Ware wird direkt versandt.
          </div>
        </div>

        <ul class="ec-checkout__totals">
        <li class="total">
            <span>Gesamtbetrag</span>
            <span>{ formatCurrency(this.amount) }</span>
        </li>
        </ul>

        {this.getPrivacyFragment({intro: false})}

        <div class="ec-checkout__actions form-submit">
          <button type="button" class={{'btn': true, 'btn-primary': true, "loading": this.submitButtonClicked}} onClick={() => this.submitHandler()}>
            Weiter zum Rechnungskauf
          </button>
        </div>

    </div>])
  }

  getPrivacyFragment({intro = true}) {
    const html = <div class="privacy">
      { intro && <p><strong>Mit Klick auf Akzeptieren stimmen Sie der Datenübermittlung zu:</strong></p> }
      <div class="form-check">
        <label class="form-check-label" htmlFor="modalAgreement">
          <small>{ this.webshopInfo?.privacyApprovalForm }</small>
        </label>
      </div>
    </div>
    return html
  }

  getModalFragment () {
    return ([
      <easycredit-modal
          ref={(el) => this.modal = el as HTMLEasycreditModalElement}
          onModalClosed={() => this.submitButtonClicked = false }
          onModalSubmit={() => this.submitHandler()}
      >
        <div slot="heading">Weiter zum Ratenkauf</div>
        <div slot="content">
          {this.getPrivacyFragment({})}
        </div>
        <span slot="button">Akzeptieren</span>
      </easycredit-modal>
    ])
  }

  render() {
    if (!this.isActive) {
      return null
    }

    return ([
      <div class="ec-checkout-container">
        <div class="ec-checkout">
          { this.getPaymentPlan() && this.getPaymentPlanFragment() }

          {
            !this.getPaymentPlan() &&
            <div class="ec-checkout-wrapper">
              { this.alert &&
                <div class="ec-checkout__alert">
                  { this.alert }
                </div>
              }
              { this.method === METHODS.INSTALLMENT_PAYMENT && this.getCheckoutInstallmentFragment() }
              { this.method === METHODS.BILL_PAYMENT && this.getCheckoutBillPaymentFragment() }
            </div>
          }
        </div>
        { this.getModalFragment() }
      </div>
    ])
  }
}

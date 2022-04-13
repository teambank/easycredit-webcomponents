import { Component, Prop, State, Listen, Element, h } from '@stencil/core';
import { formatCurrency, fetchInstallmentPlans, fetchAgreement } from '../../utils/utils';

@Component({
  tag: 'easycredit-checkout',
  styleUrl: 'easycredit-checkout.scss',
  shadow: true,
})

export class EasycreditCheckout {

  @Prop() isActive: boolean = true
  @Prop() amount: number
  @Prop() webshopId: string
  @Prop() alert: string
  @Prop() paymentPlan: string
  @Prop() askForPrefix: boolean = false

  @State() privacyApprovalForm: string
  @State() privacyCheckboxChecked: boolean = false

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

  modal!: HTMLEasycreditModalElement;

  @Listen('selectedInstallment')
  selectedInstallmentHandler(e) {
    this.selectedInstallment = this.installments.find(i => i.numberOfInstallments == e.detail)
  }

  async componentWillLoad () {
    if (this.amount > 0 && !this.alert && !this.paymentPlan) {
      await fetchInstallmentPlans(this.webshopId, this.amount).then((data) => {
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

      if (this.alert) {
        return
      }

      fetchAgreement(this.webshopId).then(data => {
        this.privacyApprovalForm = data.privacyApprovalForm

        if (this.amount < data.minFinancingAmount
          || this.amount > data.maxFinancingAmount
        ) {
        }
      }).catch(e => {
        console.error(e)
        this.alert = 'Es ist ein Fehler aufgetreten.'
      })
    }
  }

  @Element() el: HTMLElement;

  onSubmit() {
    this.el.dispatchEvent(new CustomEvent('submit', {
      bubbles    : true,
      cancelable : true,
      detail: {
        numberOfInstallments: this.selectedInstallment.numberOfInstallments,
        privacyCheckboxChecked: this.privacyCheckboxChecked
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

  getCheckoutFragment () {
    if (this.alert) {
      return <div class="ec-checkout__alert">
        { this.alert }
      </div>
    }

    return ([<div class="ec-checkout__body" /* :class="bodyClasses" */ >
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
          <button type="button" class="btn btn-primary" onClick={() => this.modal.open()} /* disabled={this.submitDisabled} */ >
              Weiter zum Ratenkauf
          </button>
        </div>

        <p class="ec-checkout__small-print">
          <small innerHTML={this.example} />
        </p>
      </div>
    ])
  }

  getPrefixFragment () {
    if (true || !this.askForPrefix) {
      return
    }
    /* 
    return <div class="title">
      <p><strong>Für ratenkauf by easyCredit bitte eine Anrede auswählen:</strong></p>
      <div class="form-radio badges">
        <span v-for="(label, key) in modal.prefix.options" :key="key">
          <input
              :id="'modalPrefix' + key"
              v-model="modal.prefix.value"
              class="form-check-input"
              type="radio"
              name="easycredit-prefix"
              :value="key"
              @change.stop=""
          >
          <label class="form-check-label" :for="'modalPrefix' + key">
            { label }
          </label>
        </span>
      </div>
    </div>
    */
  }

  handleCheckbox (e) {
    this.privacyCheckboxChecked = e.target.checked
  }

  getPrivacyFragment() {
    return <div class="privacy">
      <p><strong>Bitte stimmen Sie der Datenübermittlung zu:</strong></p>
      <div class="form-check">
        <input id="modalAgreement" onInput={(e) => this.handleCheckbox(e)} class="form-check-input" type="checkbox" name="easycredit-agreement" value="1" />
        <label class="form-check-label" htmlFor="modalAgreement">
          <small>{ this.privacyApprovalForm }</small>
        </label>
      </div>
    </div>    
  }

  getModalFragment () {
    return ([
      <easycredit-modal ref={(el) => this.modal = el as HTMLEasycreditModalElement}>
        <div slot="heading">Weiter zum Ratenkauf</div>
        <div slot="content">
          {this.getPrefixFragment()}
          {this.getPrivacyFragment()}

          <div class="form-submit">
            <button class="btn btn-primary" type="button" onClick={() => { this.onSubmit() }} disabled={!this.privacyCheckboxChecked}>
              Akzeptieren
            </button>
          </div>
        </div>
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
              { this.getCheckoutFragment() }
            </div>
          }
        </div>
        { this.getModalFragment() }
      </div>
    ])
  }
}

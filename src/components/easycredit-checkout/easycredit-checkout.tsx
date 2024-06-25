import { Component, Prop, State, Listen, Element, h } from '@stencil/core';
import { formatCurrency, fetchInstallmentPlans, fetchSingleInstallmentPlan, fetchAgreement, sendFeedback, addErrorHandler } from '../../utils/utils';
import { getVariant } from '../../utils/split-test';

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

  /**
   * Disable Flexprice in calculation
   */
  @Prop() disableFlexprice: boolean = false

  @State() privacyApprovalForm: string
  @State() acceptButtonClicked: boolean = false

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

      getVariant()
      sendFeedback(this, { component: 'EasycreditCheckout', action: 'view' });

    }
  }

  @Element() el: HTMLElement;

  modalSubmitHandler() {
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

  getCheckoutFragment () {
    if (this.alert) {
      return <div class="ec-checkout__alert">
        { this.alert }
      </div>
    }

    const variant = getVariant()

    return ([
      <div class="ec-checkout__body" /* :class="bodyClasses" */ >
        {variant !== 'usp'
          ? <easycredit-checkout-installments
            installments={JSON.stringify(this.installments)}
            /* v-model="selectedInstalment" :instalments="instalments" */
          />
          : null
        }
        {variant !== 'usp'
          ? <ul class="ec-checkout__totals">
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
          : null
        }

        {variant === 'combined'
          ? <div class="h4">Ihre Vorteile</div>
          : null
        }
        {variant === 'usp' || variant === 'combined'
          ? <ul class="ec-checkout__usp" >
            <li><strong>30 Tage</strong> nach Lieferung zahlen</li>
            <li>Flexible monatliche Wunschrate</li>
            <li>Kostenfreie Ratenanpassung & Sondertilgung</li>
          </ul>
          : null
        }

        <div class="ec-checkout__actions form-submit">
          <button type="button" class="btn btn-primary" onClick={() => this.modal.open()} /* disabled={this.submitDisabled} */ >
              Weiter zum Ratenkauf
          </button>
        </div>

        {variant !== 'usp'
          ? <p class="ec-checkout__small-print">
            <small innerHTML={this.example} />
          </p>
          : null
        }
      </div>
    ])
  }

  getPrivacyFragment() {
    return <div class="privacy">
      <p><strong>Mit Klick auf Akzeptieren stimmen Sie der Datenübermittlung zu:</strong></p>
      <div class="form-check">
        <label class="form-check-label" htmlFor="modalAgreement">
          <small>{ this.privacyApprovalForm }</small>
        </label>
      </div>
    </div>    
  }

  getModalFragment () {
    return ([
      <easycredit-modal
          ref={(el) => this.modal = el as HTMLEasycreditModalElement}
          onModalClosed={() => this.acceptButtonClicked = false }
          onModalSubmit={() => this.modalSubmitHandler()}
      >
        <div slot="heading">Weiter zum Ratenkauf</div>
        <div slot="content">
          {this.getPrivacyFragment()}
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
              { this.getCheckoutFragment() }
            </div>
          }
        </div>
        { this.getModalFragment() }
      </div>
    ])
  }
}

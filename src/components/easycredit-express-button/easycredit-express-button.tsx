import { Component, Prop, h, State, Listen, Element, Watch } from '@stencil/core'
import { fetchInstallmentPlans,validateInstallmentPlans, getWebshopInfo, sendFeedback, addErrorHandler } from '../../utils/utils'
import { Caps } from '../../utils/validation';
import { InstallmentPlan, InstallmentPlans, METHODS } from '../../types';
import { validateAmount } from '../../utils/validation';

@Component({
  tag: 'easycredit-express-button',
  styleUrl: 'easycredit-express-button.scss',
  shadow: true
})

export class EasycreditExpressButton {
  @Prop() webshopId: string
  @Prop({ mutable: true }) amount: number
  @Prop({ mutable: true }) paymentTypes: string = METHODS.INSTALLMENT
  @Prop() fullWidth: boolean = false
  @Prop() redirectUrl: string

  @State() buttonWidth: string = '100%'
  @State() selectedPaymentType: METHODS
  @State() installmentPlans: InstallmentPlans = null
  @State() selectedInstallment: InstallmentPlan = null

  infopageModal!: HTMLEasycreditModalElement
  checkoutModal!: HTMLEasycreditModalElement
  paymentModal!: HTMLEasycreditModalElement

  @Element() el: HTMLElement;

  caps: Caps

  @Listen('selectedInstallment', { target: 'window' })
  selectedInstallmentHandler(e) {
    this.selectedInstallment = this.installmentPlans.plans.find(i => i.numberOfInstallments == e.detail)
  }

  @Listen('openModal')
  openModalHandler() {
    this.checkoutModal.open()
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'openCheckoutModal' })
  }

  @Watch('amount')
  async onAmountChanged(amount: number, oldAmount: number) {
    if (!amount) {
        this.installmentPlans = null
        return
    }
    if (amount !== oldAmount && amount > 0) {
      try {
        const installmentPlans = await fetchInstallmentPlans(this.webshopId, this.amount)
        this.installmentPlans = validateInstallmentPlans(installmentPlans)
      } catch (e) {
        this.installmentPlans = null
        console.error(e)
      }
    }
  }

  openInfopageModal() {
    this.infopageModal.open()
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'openInfopageModal' })
  }

  isEnabled(type: METHODS) {
    return this.caps.isEnabled(type)
  }

  isValid(type: METHODS) {
    let valid;
    try {
      validateAmount(this.amount, type)
      valid = true
    } catch (e) {
      valid = false
    }
    return this.isEnabled(type) && valid
  }

  async componentWillLoad() {
    this.caps = new Caps(this.paymentTypes)
    
    try {
      //const opts = this.disableFlexprice ? { 'withoutFlexprice': this.disableFlexprice } : {}
      await getWebshopInfo(this.webshopId)
      // validateAmount(this.amount, this.method)
    } catch (errorMessage) {
      let alert = errorMessage ?? 'Es ist ein Fehler aufgetreten.'
      console.error(alert)
    }

    this.onAmountChanged(this.amount, null);
  }

  getCheckoutModalFragment() {
      return ([
          <easycredit-modal class={{ "ec-express-button__modal__checkout": true }}
              ref={(el) => this.checkoutModal = el as HTMLEasycreditModalElement}
              onModalSubmit={() => this.modalSubmitHandler()}
              size="checkout"
          >
              <div slot="content">
                  <div class="checkout-modal-wrapper ec-row">
                      <div class="ec-col ec-col-method">
                          <div class="ec-container">
                              <easycredit-logo
                                payment-type={METHODS.INSTALLMENT}
                              ></easycredit-logo>

                              {
                                this.isEnabled(METHODS.INSTALLMENT) &&
                                this.isEnabled(METHODS.BILL) &&
                                <div class="ec-switch">
                                    <button onClick={() => this.switchPaymentType(METHODS.INSTALLMENT)}
                                      class={{ 'active': this.selectedPaymentType === METHODS.INSTALLMENT }} >Ratenkauf</button>
                                    <button onClick={() => this.switchPaymentType(METHODS.BILL)}
                                      class={{ 'active': this.selectedPaymentType === METHODS.BILL }}>Rechnungskauf</button>
                                </div>
                              }

                              {this.selectedPaymentType === METHODS.INSTALLMENT &&
                                  <easycredit-checkout-installments installments={JSON.stringify(this.installmentPlans.plans)} rows={3} />
                              }
                              {this.selectedPaymentType === METHODS.BILL &&
                                  <easycredit-checkout-bill-payment-timeline></easycredit-checkout-bill-payment-timeline>
                              }

                              <easycredit-checkout-totals amount={this.amount} selectedInstallment={this.selectedInstallment} installmentPlans={this.installmentPlans}></easycredit-checkout-totals>
                          </div>

                          <div class="ec-background">
                            <div class="ec-circle"></div>
                            <div class="ec-circle ec-circle-secondary"></div>
                          </div>
                      </div>

                      <div class="ec-col ec-col-agreement">
                          <div class="ec-container">
                              {this.selectedPaymentType === METHODS.INSTALLMENT &&
                                  <span slot="heading">Weiter zum Ratenkauf</span>
                              }
                              {this.selectedPaymentType === METHODS.BILL &&
                                  <span slot="heading">Weiter zum Rechnungskauf</span>
                              }

                              <p><strong>Mit Klick auf Akzeptieren stimmen Sie der Datenübermittlung zu:</strong></p>
                              <easycredit-checkout-privacy-approval webshop-id={this.webshopId} />
                          </div>
                      </div>
                  </div>
              </div>
              <span slot="button">Akzeptieren</span>
          </easycredit-modal>
      ])
  }

  modalSubmitHandler() {
      sendFeedback(this, { component: 'EasycreditExpressButton', action: 'submit' })
      if (this.redirectUrl) {
          this.paymentModal.open();
          this.checkoutModal.close();
      } else {
          addErrorHandler(this, () => {
              alert('Leider ist eine Zahlung mit easyCredit derzeit nicht möglich. Bitte verwenden Sie eine andere Zahlungsart oder wenden Sie sich an den Händler.')
              this.checkoutModal.close()
          })
          this.el.dispatchEvent(new CustomEvent('submit', {
              bubbles: true,
              cancelable: true,
              composed: true,
              detail: {
                paymentType: this.selectedPaymentType,
                ...(this.selectedInstallment?.numberOfInstallments && { numberOfInstallments: this.selectedInstallment?.numberOfInstallments })
              }
          }))
      }
  }

  getPaymentModalFragment() {
      if (!this.redirectUrl) {
          return;
      }

      return ([
          <easycredit-modal class={{ "ec-express-button__modal__payment": true }} ref={(el) => this.paymentModal = el as HTMLEasycreditModalElement} size="full">
              <iframe src={this.redirectUrl} slot="content" class="iframe-full"></iframe>
          </easycredit-modal>
      ])
  }

  clickHandler = (event: CustomEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if ( event.detail !== this.selectedPaymentType ) {
        this.switchPaymentType(event.detail as METHODS)
      }
      this.checkoutModal.open()
  }

  switchPaymentType (paymentType: METHODS) {
      this.selectedPaymentType = paymentType
      this.selectedInstallment = null
      sendFeedback(this, { component: 'EasycreditExpressButton', action:'switchPaymentType', paymentType: this.selectedPaymentType })
  }

  render () {
    if (!this.isValid(METHODS.INSTALLMENT) && !this.isValid(METHODS.BILL)) {
      return;
    }
    return [
      <div class="ec-express-button">
        {this.isEnabled(METHODS.INSTALLMENT) &&
          <easycredit-express-button-single 
            onButtonClicked={this.clickHandler.bind(this)} 
            payment-type={METHODS.INSTALLMENT} 
            webshop-id={this.webshopId} 
            amount={this.amount}
            full-width={this.fullWidth}
          ></easycredit-express-button-single>
        }
        {this.isEnabled(METHODS.BILL) &&
          <easycredit-express-button-single 
            onButtonClicked={this.clickHandler.bind(this)} 
            payment-type={METHODS.BILL} 
            webshop-id={this.webshopId} 
            amount={this.amount}
            full-width={this.fullWidth}
          ></easycredit-express-button-single>
        }

        <a class="ec-express-button__link" target="_blank" style={{ width: this.buttonWidth }} onClick={() => this.openInfopageModal()}>
          <div class="icon"></div>
          <div>Mehr zum <strong>Bezahlen mit easyCredit</strong></div>
        </a>

        {this.getCheckoutModalFragment()}
        {this.getPaymentModalFragment()}

        <easycredit-modal class={{ "ec-express-button__modal__infopage": true }} ref={(el) => this.infopageModal = el as HTMLEasycreditModalElement} size="infopage">
          <easycredit-infopage slot="content" />
        </easycredit-modal>
      </div>
    ]
  }
}

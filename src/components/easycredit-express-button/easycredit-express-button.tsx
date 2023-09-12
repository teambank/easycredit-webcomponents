import { Component, Prop, State, Element, Listen, Watch, h } from '@stencil/core';
import { fetchInstallmentPlans, applyAssetsUrl, sendFeedback } from '../../utils/utils';

@Component({
  tag: 'easycredit-express-button',
  styleUrl: 'easycredit-express-button.scss',
  shadow: true,
})

export class EasycreditExpressButton {

  @Prop() webshopId: string
  @Prop() amount: number
  @Prop() alert: string
  @Prop() redirectUrl: string

  @Prop() bgBlue: boolean = false
  @Prop() fullWidth: boolean = false

  @State() installments
  @State() example

  buttonTextDefault: string = 'Jetzt direkt in Raten zahlen'
  buttonTextDefaultShort: string = 'Jetzt in Raten zahlen'
  buttonTextHover: string = 'mit easyCredit-Ratenkauf'
  @State() buttonTextTimeout = null

  @State() buttonOpacity: string = '0'
  @State() buttonWidth: string = '100%'
  @State() buttonText: string = this.buttonTextDefault
  @State() buttonTextWidth: string = 'auto'

  /*
  @Listen('resize', { target: 'window' })

  }
  */

  @Element() el: HTMLElement;

  checkoutModal!: HTMLEasycreditModalElement
  infopageModal!: HTMLEasycreditModalElement
  paymentModal!: HTMLEasycreditModalElement

  connectedCallback() {
    applyAssetsUrl(EasycreditExpressButton)
  }

  async componentWillLoad () {
    if (this.amount > 0 && !this.alert) {
      this.onAmountChanged(this.amount, null);
    }
  }

  @Listen('openModal')
  openModalHandler () {
    this.checkoutModal.open()
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'openCheckoutModal' })
  }

  @Watch('amount')
  onAmountChanged(amount: number, oldAmount: number) {
    if (!amount) {
        this.installments = null
    }
    if (amount !== oldAmount && amount > 0) {
      fetchInstallmentPlans(this.webshopId, amount).then((data) => {
        this.installments = data
      }).catch(e => {
        this.installments = null
        console.error(e)
      })
    }
  }

  componentDidLoad () {
    this.renderButton()
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'componentDidLoad' })
  }
  componentDidUpdate () {
    this.setButtonTextWidth()
  }

  async renderButton () {
    await this.setButtonText()
    await this.setButtonWidth()
    await this.setButtonTextWidth()
    this.buttonOpacity = '1'
  }

  getButtonTextWidth () {
    var textFinancing: HTMLElement = this.el.shadowRoot.querySelector('.financing');
    // var textRate: HTMLElement = this.el.shadowRoot.querySelector('.rate');

    widthTotal = null;
    if ( textFinancing ) {
      var widthTotal = textFinancing.offsetWidth;
    }

    return widthTotal;
  }
  getButtonWidth () {
    var button: HTMLElement = this.el.shadowRoot.querySelector('.ec-express-button__btn__main');
    var logo: HTMLElement = this.el.shadowRoot.querySelector('.logo');
    var textWidth = this.getButtonTextWidth();

    widthTotal = null;
    if ( button && logo && textWidth ) {
      var widthTotal = parseInt(window.getComputedStyle(button, null).getPropertyValue('padding-left'), 10) + parseInt(window.getComputedStyle(button, null).getPropertyValue('padding-right'), 10) + logo.offsetWidth + textWidth;
    }

    return widthTotal;
  }

  setButtonText () {
    var component: HTMLElement = this.el.shadowRoot.querySelector('.ec-express-button');
    var buttonWidth = this.getButtonWidth();

    if ( component && buttonWidth ) {
      if ( component.offsetWidth < buttonWidth ) {
        this.buttonText = this.buttonTextDefaultShort;
      }
    }
  }
  setButtonWidth () {
    var buttonWidth = this.getButtonWidth();

    if ( buttonWidth ) {
      this.buttonWidth = buttonWidth + 'px';
    }
  }
  setButtonTextWidth () {
    var textWidth = this.getButtonTextWidth();

    if ( textWidth ) {
      this.buttonTextWidth = textWidth + 'px';
    }
  }

  onMouseEnter () {
    window.clearTimeout(this.buttonTextTimeout)

    this.buttonText = this.buttonTextHover;
  }
  onMouseLeave () {
    window.clearTimeout(this.buttonTextTimeout)
    this.buttonTextTimeout = window.setTimeout(() => {
      this.buttonText = this.buttonTextDefault;
    },1000)
  }

  modalSubmitHandler() {
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'submit' })
    if (this.redirectUrl) {
      this.paymentModal.open();
      this.checkoutModal.close();
    } else {
      this.el.dispatchEvent(new CustomEvent('submit', {
        bubbles    : true,
        cancelable : true,
        composed: true,
        detail: {
          numberOfInstallments: null
        }
      }))
    }
  }

  getCheckoutModalFragment () {
    return ([
      <easycredit-modal class={{ "ec-express-button__modal__checkout": true }}
          ref={(el) => this.checkoutModal = el as HTMLEasycreditModalElement}
          onModalSubmit={() => this.modalSubmitHandler()}
          size="small"
      >
        <span slot="heading">Weiter zum Ratenkauf</span>
        <div slot="content">
          <p><strong>Mit Klick auf Akzeptieren stimmen Sie der Datenübermittlung zu:</strong></p>
          <easycredit-checkout-privacy-approval slot="content" webshop-id={this.webshopId} />
        </div>
        <span slot="button">Akzeptieren</span>
      </easycredit-modal>
    ])
  }

  getPaymentModalFragment () {
    if (!this.redirectUrl) {
      return;
    }

    return ([
      <easycredit-modal class={{ "ec-express-button__modal__payment": true }} ref={(el) => this.paymentModal = el as HTMLEasycreditModalElement} size="full">
        <iframe src={this.redirectUrl} slot="content" class="iframe-full"></iframe>
      </easycredit-modal>
    ])
  }

  openInfopageModal () {
    this.infopageModal.open()
    sendFeedback(this, { component: 'EasycreditExpressButton', action: 'openInfopageModal' })

  }

  render() {
    if (this.alert) {
        return;
    }
    if (
        this.installments && (
          this.amount < this.installments.minFinancingAmount ||
          this.amount > this.installments.maxFinancingAmount
        )
    ) {
        return;
    }

    return ([
      <div class="ec-express-button" style={{ opacity: this.buttonOpacity }}>
        <div class={{ "ec-express-button__btn": true, "blue": this.bgBlue, "full-width": this.fullWidth }} style={{ width: this.buttonWidth }}>
          <a class="ec-express-button__btn__main"
            onClick={() => this.openModalHandler()}
            onMouseEnter={() => this.onMouseEnter()}
            onMouseLeave={() => this.onMouseLeave()}
          >
            <div class="logo"></div>
            <div class="ec-express-button__btn__main__inner" style={{ flexBasis: this.buttonTextWidth, width: this.buttonTextWidth }}>
              <span class="financing">{ this.buttonText }</span>
            </div>
          </a>

          { this.getCheckoutModalFragment() }
          { this.getPaymentModalFragment() }
        </div>

        <a class="ec-express-button__link" target="_blank" style={{ width: this.buttonWidth }} onClick={() => this.openInfopageModal() }>
          <div class="icon"></div>
          <div>Mehr zu <strong>easyCredit-Ratenkauf</strong></div>
        </a>

        <easycredit-modal class={{ "ec-express-button__modal__infopage": true }} ref={(el) => this.infopageModal = el as HTMLEasycreditModalElement} size="infopage">
          <easycredit-infopage slot="content" />
        </easycredit-modal>
      </div>
    ])
  }
}

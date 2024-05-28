import { Component, Prop, State, Element, h, EventEmitter, Event } from '@stencil/core';
import { applyAssetsUrl } from '../../utils/utils';
import { METHODS } from '../../types';
import { validateAmount } from '../../utils/validation';

@Component({
  tag: 'easycredit-express-button-single',
  styleUrl: 'easycredit-express-button-single.scss',
  shadow: true,
})

export class EasycreditExpressButtonSingle {

  @Prop() webshopId: string
  @Prop() amount: number
  @Prop() bgBlue: boolean = false
  @Prop() fullWidth: boolean = false
  @Prop() paymentType: METHODS = METHODS.INSTALLMENT

  buttonTextDefault: string = 'Jetzt direkt in Raten zahlen'
  buttonTextDefaultShort: string = 'Jetzt in Raten zahlen'
  buttonTextHover: string = 'mit easyCredit-Ratenkauf'

  @State() buttonTextTimeout = null
  @State() buttonOpacity: string = '0'
  @State() buttonWidth: string = '100%'
  @State() buttonText: string = this.buttonTextDefault
  @State() buttonTextWidth: string = 'auto'

  @Element() el: HTMLElement;

  connectedCallback() {
    applyAssetsUrl(EasycreditExpressButtonSingle)
  }

  async componentWillLoad () {    
    if (this.paymentType === METHODS.BILL) {
      this.bgBlue = true
    }
  }

  @Event() buttonClicked: EventEmitter<string>;
  clickButtonHandler(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.buttonClicked.emit(this.paymentType)
  }

  componentDidLoad () {
    this.renderButton()
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

    if (this.paymentType === METHODS.BILL) {
      this.buttonText = 'Jetzt bestellen - später bezahlen';
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
    if (this.paymentType === METHODS.BILL) {
      return
    }

    window.clearTimeout(this.buttonTextTimeout)

    this.buttonText = this.buttonTextHover;
  }
  onMouseLeave () {
    if (this.paymentType === METHODS.BILL) {
      return
    }

    window.clearTimeout(this.buttonTextTimeout)
    this.buttonTextTimeout = window.setTimeout(() => {
      this.buttonText = this.buttonTextDefault;
    },1000)
  }

  render() {
    try {
      validateAmount(this.amount, this.paymentType)
    } catch (e) {
      return
    }

    return ([
      <div class="ec-express-button" style={{ opacity: this.buttonOpacity }}>
        <div class={{ "ec-express-button__btn": true, "blue": this.bgBlue, "full-width": this.fullWidth }} style={{ width: this.buttonWidth }}>
          <a class="ec-express-button__btn__main"
            onClick={this.clickButtonHandler.bind(this)}
            onMouseEnter={() => this.onMouseEnter()}
            onMouseLeave={() => this.onMouseLeave()}
          >
            <div class="logo"></div>
            <div class="ec-express-button__btn__main__inner" style={{ flexBasis: this.buttonTextWidth, width: this.buttonTextWidth }}>
              <span class="financing">{ this.buttonText }</span>
            </div>
          </a>
        </div>
      </div>
    ])
  }
}

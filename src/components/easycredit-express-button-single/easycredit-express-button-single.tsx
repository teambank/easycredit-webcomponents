import { Component, Prop, State, Element, h, EventEmitter, Event, Host } from '@stencil/core';
import { applyAssetsUrl, getAssetUrl } from '../../utils/utils';
import { METHODS } from '../../types';

@Component({
  tag: 'easycredit-express-button-single',
  styleUrl: 'easycredit-express-button-single.scss',
  shadow: {
    delegatesFocus: true,
  },
})
export class EasycreditExpressButtonSingle {
  @Prop() webshopId: string;
  @Prop() amount: number;
  @Prop() bgBlue: boolean = false;
  @Prop() fullWidth: boolean = false;
  @Prop() paymentType: METHODS = METHODS.INSTALLMENT;

  buttonTextDefault: string = 'Jetzt direkt in Raten zahlen';
  buttonTextDefaultShort: string = 'Direkt in Raten zahlen';

  @State() buttonOpacity: string = '0';
  @State() buttonText: string = this.buttonTextDefault;
  @State() buttonTextShort: string = this.buttonTextDefaultShort;

  @Element() el: HTMLElement;

  connectedCallback() {
    applyAssetsUrl(EasycreditExpressButtonSingle);
  }

  async componentWillLoad() {
    if (this.paymentType === METHODS.BILL) {
      this.bgBlue = true;
    }
  }

  @Event() buttonClicked: EventEmitter<string>;
  clickButtonHandler(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.buttonClicked.emit(this.paymentType);
  }

  componentDidLoad() {
    this.renderButton();
  }

  async renderButton() {
    await this.setButtonText();
    this.buttonOpacity = '1';
  }

  private getLogo(): string {
    if (this.paymentType === METHODS.BILL) {
      return <img alt="easyCredit-Rechnung" class="bill" src={getAssetUrl('/easycredit-components/assets/rechnungskauf-icon.svg')} />;
    } else {
      return <img alt="easyCredit-Ratenkauf" class="installment" src={getAssetUrl('/easycredit-components/assets/easycredit-logo-white.svg')} />;
    }
  }

  setButtonText() {
    if (this.paymentType === METHODS.BILL) {
      this.buttonText = 'Heute bestellen - in 30 Tagen zahlen';
      this.buttonTextShort = 'In 30 Tagen zahlen';
    }
  }

  render() {
    return (
      <Host>
        <div
          class="ec-express-button"
          style={{ opacity: this.buttonOpacity }}
        >
          <button class={{ 'ec-express-button__btn': true, 'blue': this.bgBlue, 'full-width': this.fullWidth, 'small-padding': this.paymentType === METHODS.INSTALLMENT }} onClick={this.clickButtonHandler.bind(this)}>
            <div class="ec-express-button__btn__main">
              {this.getLogo()}
              <span class="long">{this.buttonText}</span>
              <span class="short">{this.buttonTextShort}</span>
            </div>
          </button>
        </div>
      </Host>
    );
  }
}

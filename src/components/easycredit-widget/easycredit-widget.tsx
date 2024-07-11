import { Component, Prop, State, Watch, h } from '@stencil/core';
import { formatAmount, getWebshopInfo, fetchInstallmentPlans } from '../../utils/utils';
import { applyAssetsUrl, sendFeedback } from '../../utils/utils';
import { Caps, validateAmount } from '../../utils/validation';
import { WebshopInfo, InstallmentPlans, METHODS } from '../../types';
import state from '../../stores/general'

@Component({
  tag: 'easycredit-widget',
  styleUrl: 'easycredit-widget.scss',
  shadow: true,
})
export class EasycreditWidget {


  @Prop() webshopId: string
  @Prop({ mutable: true }) amount: number
  @Prop() displayType: string
  @Prop({ mutable: true }) paymentTypes: string = 'BILL,INSTALLMENT'
  @Prop({ mutable: true }) extended: boolean = true
  @Prop({ mutable: true }) disableFlexprice: boolean = false

  @State() installmentPlans: InstallmentPlans
  @State() isValid: boolean = false
  @State() widgetLayout: string = ''
  @State() webshopInfo: WebshopInfo = null

  modal!: HTMLEasycreditModalElement;
  widgetElement!: HTMLElement;

  caps: Caps

  @Watch('amount')
  async onAmountChanged(amount: number, oldAmount: number) {
    if (!this.isEnabled(METHODS.INSTALLMENT)){
      return
    }
    try {
      validateAmount(this.amount, METHODS.INSTALLMENT)
    } catch (e) {
      return;
    }

    if (amount !== oldAmount) {
      try {
        const opts = this.disableFlexprice ? { 'withoutFlexprice': this.disableFlexprice } : {}
        this.installmentPlans = await fetchInstallmentPlans(this.webshopId, this.amount, opts)
        this.isValid = true
      } catch (e) {
        this.installmentPlans = null
        console.error(e)
      }
    }
  }

  connectedCallback() {
    applyAssetsUrl(EasycreditWidget)
  }

  isEnabled(type: METHODS) {
    return this.caps.isEnabled(type)
  }
  
  async componentWillLoad() {
    this.caps = new Caps(this.paymentTypes)
    this.onAmountChanged(this.amount, 0);

    try {
      await getWebshopInfo(this.webshopId)
      this.isValid = true
    } catch(e) {
      console.error(e)
    }
  }

  componentDidRender() {
    this.setWidgetLayout();
  }

  getInstallmentPlan() {
    if (!this.installmentPlans || !this.installmentPlans.plans) {
      return null
    }
    return this.installmentPlans
  }

  getMinimumInstallment() {
    if (!this.getInstallmentPlan()?.plans) {
      return
    }
    return this.getInstallmentPlan().plans
      .sort((a,b) => a.installment - b.installment)
      .find(() => true)
  }

  clickHandler(e: MouseEvent): void {
    e.preventDefault();
  }

  private getLogo(): string {
    return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z" fill="#0066B3"/><path d="M16.0182 8.485C15.6336 8.35415 14.9276 8.20565 13.7441 8.20565C12.6663 8.19999 11.6242 8.5923 10.8178 9.3074C10.7305 9.38307 10.6303 9.44247 10.5221 9.48275C9.7788 9.73409 8.99616 9.84872 8.21205 9.82108H8.18913C7.4093 9.82108 6.91993 9.69022 6.63403 9.45608C6.37237 9.2395 6.26438 8.91762 6.28403 8.46357H11.4354L11.4517 8.38897C11.5575 7.94037 11.6249 7.48357 11.6532 7.02353C11.6532 5.96297 11.2986 5.13732 10.6843 4.57792C10.0699 4.01852 9.21033 3.73262 8.21525 3.73262C6.53387 3.73262 5.39488 4.41173 4.67858 5.31725C4.03623 6.15066 3.68382 7.17114 3.675 8.22333C3.66511 8.68323 3.74964 9.14027 3.92336 9.5662C4.09708 9.99214 4.3563 10.3779 4.685 10.6997C5.35098 11.337 6.32843 11.7282 7.58975 11.7282C8.19472 11.7296 8.79923 11.6947 9.4 11.6235C9.2942 12.0181 9.24011 12.4248 9.2391 12.8333C9.2391 13.8415 9.57933 14.6986 10.2204 15.3117C10.8747 15.9371 11.8128 16.2675 12.929 16.2675C13.4788 16.2622 14.0261 16.193 14.56 16.0614L14.7785 16.0051L15.2672 13.6498L14.613 13.9533C14.168 14.1497 13.686 14.2479 13.1998 14.2412C12.8226 14.264 12.4502 14.1476 12.1531 13.9141C11.8993 13.687 11.7704 13.3409 11.7704 12.8842C11.7813 12.2515 11.9824 11.6367 12.3474 11.1197C12.5324 10.8472 12.7812 10.6239 13.0722 10.4695C13.3632 10.3151 13.6875 10.2342 14.017 10.2339C14.5264 10.2198 15.0348 10.2894 15.5217 10.44L15.907 10.5708L16.325 8.58778L16.0182 8.485ZM6.47697 6.9253C6.58858 6.54542 6.82291 6.21322 7.14332 5.98062C7.46373 5.74802 7.85218 5.62813 8.24795 5.63968C8.41942 5.62604 8.5916 5.65525 8.74897 5.72469C8.90634 5.79414 9.04398 5.90162 9.14948 6.03748C9.31943 6.30205 9.4075 6.61089 9.40267 6.9253H6.47697Z" fill="white"/></svg>
  }

  private getCtaIcon(): string {
    return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 0C6.55228 0 7 0.447715 7 1V5H11C11.5523 5 12 5.44772 12 6C12 6.55228 11.5523 7 11 7H7V11C7 11.5523 6.55228 12 6 12C5.44772 12 5 11.5523 5 11V7H1C0.447715 7 0 6.55228 0 6C0 5.44772 0.447715 5 1 5H5V1C5 0.447715 5.44772 0 6 0Z" fill="#002C5A"/></svg>
  }

  private getInstallmentText(): string {
    if (!this.isEnabled(METHODS.INSTALLMENT)) {
      return
    }
    
    let info = state.webshopInfo
    if (this.amount < info.minInstallmentValue) {
      if (!this.extended) {
        return
      }
      return <span>
          Finanzieren ab&nbsp;
          <em>{info.minInstallmentValue.toLocaleString('de-DE', {maximumFractionDigits: 0})} &euro; Bestellwert</em>
      </span>
    }
    if (this.amount > info.maxInstallmentValue) {
      if (!this.extended) {
        return
      }
      return <span>
        Finanzieren bis&nbsp;
        <em>{info.maxInstallmentValue.toLocaleString('de-DE', {maximumFractionDigits: 0})} &euro; Bestellwert</em>
      </span>
    }

    if (this.getMinimumInstallment()) {
      return <span>
        Finanzieren ab&nbsp;
        <a class="ec-widget__link" onClick={() => this.openModal()}><em>{formatAmount(this.getMinimumInstallment().installment)} &euro; / Monat</em></a>
      </span>
    }
  }

  private getBillPaymentText(): string {
    if (!this.isEnabled(METHODS.BILL)) {
      return
    }

    const info = state.webshopInfo
    if (!info) {
      return
    }

    if (this.amount < info.minBillingValue) {
      if (!this.extended) {
        return
      }
      return <span>
        mit <a class="ec-widget__link" onClick={() => this.openModal()}>Rechnung</a> bezahlen ab {info.minBillingValue.toLocaleString('de-DE', { maximumFractionDigits: 0 })} &euro;
      </span>  
    }
      
    if (this.amount > info.maxBillingValue) {
      if (!this.extended) {
        return
      }
      return <span>
        mit <a class="ec-widget__link" onClick={() => this.openModal()}>Rechnung</a> bezahlen bis {info.maxBillingValue.toLocaleString('de-DE', { maximumFractionDigits: 0 })} &euro;
      </span>      
    }

    const firstLetter = this.getInstallmentText() ? 'h' : 'H'
    return <span>
      {firstLetter}eute bestellen, in <a class="ec-widget__link" onClick={() => this.openModal()}>30 Tagen</a> zahlen
    </span>
  }

  openModal (): void {
    sendFeedback(this, { component: 'EasycreditWidget', action: 'openModal' }); 
    this.modal.open()
  }

  setWidgetLayout(): void {
    if ( !this.widgetElement ) {
      return;
    }
    this.widgetLayout = this.widgetElement.getBoundingClientRect().width < 251 ? 'small' : '';
  }

  getModalFragment () {
    return ([
      <easycredit-modal ref={(el) => this.modal = el as HTMLEasycreditModalElement} size="payment">
          <iframe data-src={this.getInstallmentPlan()?.url} slot="content"></iframe>
      </easycredit-modal>
    ])
  }

  render() { 
    return ([
      this.isValid &&
      (this.getInstallmentText() || this.getBillPaymentText()) &&
      <div class="ec-widget-container">
        <div class={{
          'ec-widget': true,
          ['layout-' + this.widgetLayout]: this.widgetLayout !== '',
          'clean': this.displayType === 'clean',
          'minimal': this.displayType === 'minimal'
        }} ref={(el) => this.widgetElement = el as HTMLElement} onClick={this.clickHandler}>
          {this.getLogo()}

          <span>
            {this.getInstallmentText()}
            {
              this.getInstallmentText() && 
              this.getBillPaymentText() && 
              <span class="ec-widget__separator"> oder </span>
            }
            {this.getBillPaymentText()}

            {!this.getBillPaymentText() && 
              <span class="ec-widget__brand-name"> mit easyCredit-Ratenkauf.</span>
            }
            {!this.getInstallmentText() && 
              <span class="ec-widget__brand-name"> mit easyCredit-Rechnung.</span>
            }
          </span>

          {
            this.displayType !== 'clean' && 
            this.displayType !== 'minimal' && 
            <a class="ec-widget__cta" onClick={() => this.openModal()}>{this.getCtaIcon()}</a>
          }
        </div>

        { this.getModalFragment() }
      </div>
    ])
  }
}

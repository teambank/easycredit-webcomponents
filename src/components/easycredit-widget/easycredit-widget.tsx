import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { formatAmount, getWebshopInfo, fetchInstallmentPlans, getAssetUrl } from '../../utils/utils';
import { applyAssetsUrl, sendFeedback } from '../../utils/utils';
import { Caps } from '../../utils/validation';
import { WebshopInfo, InstallmentPlans, METHODS } from '../../types';

@Component({
  tag: 'easycredit-widget',
  styleUrl: 'easycredit-widget.scss',
  shadow: {
    delegatesFocus: true
  },
})
export class EasycreditWidget {

  @Prop() webshopId: string
  @Prop({ mutable: true }) amount: number
  @Prop() displayType: string
  @Prop({ mutable: true }) paymentTypes: string = METHODS.INSTALLMENT
  @Prop({ mutable: true }) extended: boolean = true
  @Prop({ mutable: true }) disableFlexprice: boolean = false

  @State() installmentPlans: InstallmentPlans
  @State() isValid: boolean = false
  @State() widgetLayout: string = null
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
      this.caps.validateAmount(this.amount, METHODS.INSTALLMENT)
    } catch (e) {
      return;
    }

    if (amount !== oldAmount) {
      try {
        const opts = this.disableFlexprice ? { 'withoutFlexprice': this.disableFlexprice } : null
        const installmentPlans = await fetchInstallmentPlans(this.webshopId, this.amount, opts);
        this.installmentPlans = installmentPlans.installmentPlans?.find(() => true)
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
    try {
      this.webshopInfo = await getWebshopInfo(this.webshopId)
      this.caps = new Caps(this.paymentTypes, this.webshopInfo);
      this.onAmountChanged(this.amount, 0);

      this.isValid = true
    } catch(e) {
      console.error(e)
    }
  }

  componentDidRender() {
    this.setWidgetLayout();
  }

  getInstallmentPlan() {
    if (!this.installmentPlans) {
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
    return <img alt="easyCredit Logo" src={getAssetUrl('/easycredit-components/assets/easycredit-supersign.svg')} />;
  }

  private getCtaIcon(): string {
    return <img alt="mehr erfahren" src={getAssetUrl('/easycredit-components/assets/icon-plus.svg')} />;
  }

  private getInstallmentText(): string {
    if (!this.isEnabled(METHODS.INSTALLMENT)) {
      return
    }
    
    let info = this.webshopInfo
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
      return (
        <span>
          Finanzieren ab&nbsp;
          <button class="ec-widget__link" onClick={() => this.openModal(METHODS.INSTALLMENT)}>
            <em>{formatAmount(this.getMinimumInstallment().installment)} &euro; / Monat</em>
          </button>
        </span>
      );
    }
  }

  private getBillPaymentText(): string {
    if (!this.isEnabled(METHODS.BILL)) {
      return
    }

    const info = this.webshopInfo
    if (!info) {
      return
    }

    if (this.amount < info.minBillingValue) {
      if (!this.extended) {
        return
      }
      return (
        <span>
          mit{' '}
          <button class="ec-widget__link" onClick={() => this.openModal(METHODS.BILL)}>
            Rechnung
          </button>{' '}
          bezahlen ab {info.minBillingValue.toLocaleString('de-DE', { maximumFractionDigits: 0 })} &euro;
        </span>
      );
    }
      
    if (this.amount > info.maxBillingValue) {
      if (!this.extended) {
        return
      }
      return (
        <span>
          mit{' '}
          <button class="ec-widget__link" onClick={() => this.openModal(METHODS.BILL)}>
            Rechnung
          </button>{' '}
          bezahlen bis {info.maxBillingValue.toLocaleString('de-DE', { maximumFractionDigits: 0 })} &euro;
        </span>
      );
    }

    const firstLetter = this.getInstallmentText() ? 'h' : 'H'
    return (
      <span>
        {firstLetter}eute bestellen, in{' '}
        <button class="ec-widget__link" onClick={() => this.openModal(METHODS.BILL)}>
          30 Tagen
        </button>{' '}
        zahlen
      </span>
    );
  }

  private getFlexpriceBadge(): string {
    if (
      !this.isEnabled(METHODS.INSTALLMENT) ||
      this.webshopInfo['interestRateFlexibilisation']?.interestRate === null ||
      this.disableFlexprice === true
    ) {
      return;
    }

    const flex = this.webshopInfo['interestRateFlexibilisation']

    return <span class="badges">
        <span class="badge">{ flex.interestRate }% bei Laufzeiten bis { flex.maxInstallments } Monate</span>
    </span>
  }

  openModal (paymentType?: METHODS): void {
    sendFeedback(this, { component: 'EasycreditWidget', action: 'openModal' }); 

    this.modal.querySelector('iframe').dataset.src = this.getModalUrl(paymentType);
    this.modal.open()
  }

  setWidgetLayout(): void {
    if ( !this.widgetElement ) {
      return;
    }
    if (this.widgetLayout !== null) {
      return;
    }
    if (this.widgetElement.getBoundingClientRect().width < 251) {
      this.widgetLayout = 'small';
    }
  }

  getModalUrl (paymentType?: METHODS) {
    let url = new URL('https://ratenkauf.easycredit.de/widget/app/#/ratenwunsch');

    const params = {
      bestellwert: this.amount,
      shopKennung: this.webshopId,
      paymentSwitchPossible: this.paymentTypes.split(',').length > 1,
      ohneZinsflex: this.disableFlexprice 
    }

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    if (!paymentType) {
      const info = this.webshopInfo
      paymentType = this.amount >= info.minInstallmentValue && this.amount <= info.maxInstallmentValue ? METHODS.INSTALLMENT : METHODS.BILL;
    }
    if (!this.isEnabled(paymentType)) {
      paymentType = paymentType === METHODS.INSTALLMENT ? METHODS.BILL : METHODS.INSTALLMENT;
    }

    url.searchParams.append('paymentType', paymentType + '_PAYMENT');

    return url.origin + url.pathname + url.hash + url.search;
  }

  getModalFragment () {
    return ([
      <easycredit-modal ref={(el) => this.modal = el as HTMLEasycreditModalElement} size="payment">
          <iframe title="easyCredit Ratenrechner" slot="content"></iframe>
      </easycredit-modal>
    ])
  }

  render() { 
    return (
      this.isValid &&
      (this.getInstallmentText() || this.getBillPaymentText()) && (
        <Host tabindex="0">
          <div class="ec-widget-container">
            <div
              class={{
                'ec-widget': true,
                ['layout-' + this.widgetLayout]: this.widgetLayout !== null,
                'clean': this.displayType === 'clean',
                'minimal': this.displayType === 'minimal',
              }}
              ref={el => (this.widgetElement = el as HTMLElement)}
              onClick={this.clickHandler}
            >
              {this.getLogo()}

              <span>
                {this.getFlexpriceBadge()}
                {this.getInstallmentText()}
                {this.getInstallmentText() && this.getBillPaymentText() && <span class="ec-widget__separator"> oder </span>}
                {this.getBillPaymentText()}

                {!this.getBillPaymentText() && <span class="ec-widget__brand-name"> mit easyCredit-Ratenkauf.</span>}
                {!this.getInstallmentText() && <span class="ec-widget__brand-name"> mit easyCredit-Rechnung.</span>}
              </span>

              {this.displayType !== 'clean' && this.displayType !== 'minimal' && (
                <button class="ec-widget__cta" onClick={() => this.openModal()} aria-label="weitere Informationen">
                  {this.getCtaIcon()}
                </button>
              )}
            </div>

            {this.getModalFragment()}
          </div>
        </Host>
      )
    );
  }
}

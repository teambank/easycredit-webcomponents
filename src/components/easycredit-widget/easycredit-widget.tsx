import { Component, Prop, State, Watch, h } from '@stencil/core';
import { formatAmount, fetchInstallmentPlans } from '../../utils/utils';
import { applyAssetsUrl } from '../../utils/utils';

@Component({
  tag: 'easycredit-widget',
  styleUrl: 'easycredit-widget.scss',
  shadow: true,
})
export class EasycreditWidget {
  /**
   * Webshop Id
   */
  @Prop() webshopId: string

  /**
   * Financing Amount
   */
  @Prop({ mutable: true }) amount: number

  /**
   * Display Type (e.g. clean -> without shadow)
   */
  @Prop() displayType: string

  /**
   * Show if out of range
   */
  @Prop({ mutable: true }) extended: boolean = true

  modal!: HTMLEasycreditModalElement;
  widgetElement!: HTMLElement;

  @State() installments
  @State() isValid: boolean = false
  @State() widgetLayout: string = ''

  @Watch('amount')
  onAmountChanged(amount: number, oldAmount: number) {
    if (amount !== oldAmount) {
      fetchInstallmentPlans(this.webshopId, amount).then((data) => {
        this.isValid = true
        this.installments = data
      }).catch(e => {
        console.error(e)
      })
    }
  }

  connectedCallback() {
    applyAssetsUrl(EasycreditWidget)
  }
  
  componentWillLoad() {
    this.onAmountChanged(this.amount, 0);
  }

  componentDidRender() {
    this.setWidgetLayout();
    this.moveModal();
  }

  getInstallmentPlan() {
    if (!this.installments || !this.installments.installmentPlans) {
      return null
    }
    return this.installments.installmentPlans
      .find(() => true)
  }

  getMinimumInstallment() {
    if (!this.getInstallmentPlan().plans) {
      return
    }
    return this.getInstallmentPlan().plans
      .sort((a,b) => b.numberOfInstallments - a.numberOfInstallments)
      .find(() => true)
  }

  moveModal(): void {
    var target = document.querySelector('body');

    if (target && this.modal) {
      target.insertBefore(this.modal, target.lastChild);
    }
  }

  clickHandler(e: MouseEvent): void {
    e.preventDefault();
  }

  private getLinkText(): string {
    return 'Mehr Infos'
  }

  private getInstallmentText(): string {
    if (!this.installments) {
      return
    }
    if (this.amount < this.installments.minFinancingAmount) {
      if (!this.extended) {
        return
      }
      return <span>
          Finanzieren ab&nbsp;
          <em>{this.installments.minFinancingAmount.toLocaleString('de-DE', {maximumFractionDigits: 0})} &euro; Bestellwert</em>
      </span>
    }
    if (this.amount > this.installments.maxFinancingAmount) {
      if (!this.extended) {
        return
      }
      return <span>
        Finanzieren bis&nbsp;
        <em>{this.installments.maxFinancingAmount.toLocaleString('de-DE', {maximumFractionDigits: 0})} &euro; Bestellwert</em>
      </span>
    }

    if (this.getMinimumInstallment()) {
      return <span>
        Finanzieren ab&nbsp;
        <em>{formatAmount(this.getMinimumInstallment().installment)} &euro; / Monat</em>
      </span>
    }
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
      this.getInstallmentText() &&
      <div class="ec-widget-container">
        <div class={{
          'ec-widget': true,
          ['layout-' + this.widgetLayout]: this.widgetLayout !== '',
          'clean': this.displayType === 'clean'
        }} ref={(el) => this.widgetElement = el as HTMLElement} onClick={this.clickHandler}>
          {this.getInstallmentText()}
          <span class="ec-widget__brand-name"> mit easyCredit-Ratenkauf.</span>
          <a class="ec-widget__link" onClick={() => this.modal.open() }>{this.getLinkText()}</a>

          <div class="ec-widget__logo"></div>
        </div>

        { this.getModalFragment() }
      </div>
    ])
  }
}

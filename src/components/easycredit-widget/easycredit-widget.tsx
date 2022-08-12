import { Component, Prop, State, h } from '@stencil/core';
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
  @Prop() amount: number

  /**
   * Show if out of range 
   */
  // @Prop() extended: boolean = true

  modal!: HTMLEasycreditModalElement;

  @State() installments
  @State() isValid: boolean

  private getLinkText(): string {
    return 'Mehr Infos'
  }

  private getInstallmentText(): string {
    if (!this.installments) {
      return ''
    }
    if (this.amount < this.installments.minFinancingAmount) {
      return <span>
          Finanzieren ab&nbsp;
          <em>{this.installments.minFinancingAmount.toLocaleString('de-DE', {maximumFractionDigits: 0})} &euro; Bestellwert</em>
      </span>
    }
    if (this.amount > this.installments.maxFinancingAmount) {
      return <span>
        Finanzieren bis&nbsp;
        <em>{this.installments.maxFinancingAmount.toLocaleString('de-DE', {maximumFractionDigits: 0})} &euro; Bestellwert</em>
      </span>
    }
    return <span>
      Finanzieren ab&nbsp;
      <em>{formatAmount(this.getMinimumInstallment().installment)} &euro; / Monat</em>
    </span>
    
  }

  connectedCallback() {
    applyAssetsUrl(EasycreditWidget)
  }
  
  componentWillLoad() {
    this.isValid = false
    fetchInstallmentPlans(this.webshopId, this.amount).then((data) => {
      this.isValid = true
      this.installments = data
    }).catch(e => {
      console.error(e)
    })
  }

  getInstallmentPlan() {
    if (!this.installments) {
      return null
    }
    return this.installments.installmentPlans
      .find(() => true)
  }

  getMinimumInstallment() {
    return this.getInstallmentPlan().plans
    .sort((a,b) => b.numberOfInstallments - a.numberOfInstallments)
    .find(() => true)
  }

  render() { 
    return ([
      this.isValid &&
      <div class="ec-widget">
        {this.getInstallmentText()} mit easyCredit-Ratenkauf. 
        <a class="ec-widget__link" onClick={() => this.modal.open() }>{this.getLinkText()}</a>

        <div class="ec-widget__logo"></div>
      </div>,
      <easycredit-modal ref={(el) => this.modal = el as HTMLEasycreditModalElement}>
        <span slot="content">
          <iframe data-src={this.getInstallmentPlan()?.url}></iframe> 
        </span>
      </easycredit-modal>
    ])
  }
}

import { Component, Prop, State, h } from '@stencil/core';

import { formatAmount, fetchInstallmentPlans } from '../../utils/utils';

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

  getRatenkaufIcon () {
    return <svg width="46px" height="46px" viewBox="0 0 46 46" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs></defs>
      <g id="ratenkauf-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g>
          <path d="M46,23.0003853 C46,35.7027693 35.7025967,46 23,46 C10.2966326,46 0,35.7027693 0,23.0003853 C0,10.2972307 10.2966326,0 23,0 C35.7025967,0 46,10.2972307 46,23.0003853" id="blue" fill="#005DA9"></path>
          <polygon id="orange" fill="#EC6608" points="19.1197164 22.579685 12 16 12 37 19.1197164 37 19.3713154 37 34 37"></polygon>
          <path d="M25.7341311,8 L19.2650884,8 C15.2520812,8 12,11.2829473 12,15.3330708 L12,30 C12,25.9498765 15.2520812,22.6669292 19.2650884,22.6669292 L25.7341311,22.6653539 C29.7471384,22.6653539 33,19.3824066 33,15.3330708 C33,11.2829473 29.7471384,8 25.7341311,8" id="white" fill="#FFFFFF"></path>
        </g>
      </g>
    </svg>
  }

  render() { 
    return ([
      this.isValid &&
      <div class="ec-widget">
        {this.getInstallmentText()}<br />mit ratenkauf by easyCredit. 
        <a class="ec-widget__link" onClick={() => this.modal.open() }>{this.getLinkText()}</a>

        {this.getRatenkaufIcon()}
      </div>,
      <easycredit-modal ref={(el) => this.modal = el as HTMLEasycreditModalElement}>
        <span slot="content">
          <iframe data-src={this.getInstallmentPlan()?.url}></iframe> 
        </span>
      </easycredit-modal>
    ])
  }
}

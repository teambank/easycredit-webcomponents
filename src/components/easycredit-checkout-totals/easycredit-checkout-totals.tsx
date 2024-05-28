import { Component, Prop, h } from '@stencil/core';
import { formatCurrency } from '../../utils/utils';
import { InstallmentPlan, InstallmentPlans } from '../../types';
import Fragment from 'stencil-fragment'

@Component({
    tag: 'easycredit-checkout-totals',
  styleUrl: 'easycredit-checkout-totals.scss',
    shadow: true,
})

export class EasycreditCheckoutTotals {

  @Prop() amount: number
  @Prop() selectedInstallment: InstallmentPlan = null
  @Prop() installmentPlans: InstallmentPlans = null

  componentWillLoad() {
    this.resetSelectedInstallment()
  }

  componentWillRender() {
    if (!this.selectedInstallment) {
      this.resetSelectedInstallment()
    }
  }

  resetSelectedInstallment() {
    this.selectedInstallment = {
      installment: 0,
      lastInstallment: 0,
      numberOfInstallments: 0,
      totalInterest: 0,
      totalValue: this.amount
    }
  }

  /*@Listen('selectedInstallment')
  selectedInstallmentHandler(e) {
    this.selectedInstallment = this.installmentPlans.plans.find(i => i.numberOfInstallments == e.detail)
  }*/

  render () {
      return <div>
        <ul class="ec-checkout__totals">
          {this.amount !== this.selectedInstallment.totalValue &&
            <Fragment>
              <li>
                  <span>Kaufbetrag</span>
                  <span>{  formatCurrency(this.amount) }</span>
              </li>
              <li>
                  <span>+ Zinsen</span>
                  <span>{  formatCurrency(this.selectedInstallment.totalInterest) }</span>
              </li>
            </Fragment>
          }

          <li class="total">
              <span>Gesamtbetrag</span>
              <span>{ formatCurrency(this.selectedInstallment.totalValue) }</span>
          </li>
        </ul>

        <slot name="actions" />

        {this.installmentPlans &&
          <p class="ec-checkout__small-print">
            <small innerHTML={this.installmentPlans.example} />
          </p>        
        }

    </div>  
  }
}
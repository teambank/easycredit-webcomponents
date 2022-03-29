import { Component, Prop, State, h } from '@stencil/core';
import { fetchTransaction, youngerThanOneDay } from '../../utils/utils';

@Component({
  tag: 'easycredit-merchant-status-widget',
  styleUrl: 'easycredit-merchant-status-widget.scss',
  shadow: true,
})

export class EasycreditMerchantStatusWidget {

  @State() tx: any = {}
  @State() loading: boolean = false

  @Prop() txId: string
  @Prop() date: string
  @Prop() isManager: boolean

  async componentWillLoad () {
    this.loading = true
    fetchTransaction(this.txId).then((transaction) => {
        this.tx = transaction
        this.loading = false
      }).catch((e) => {
      console.error(e)
      this.loading = false
    })

  }

  getStatusLabel () {
      let labels = {
        'REPORT_CAPTURE':                   'Lieferung melden',
        'REPORT_CAPTURE_EXPIRING':          'Lieferung melden (auslaufend)',
        'IN_BILLING':                       'In Abrechnung',
        'BILLED':                           'Abgerechnet',
        'EXPIRED':                          'Abgelaufen'
      }
      if (!this.tx || !this.tx.status) {
        if (youngerThanOneDay(this.date)) {
          return 'noch nicht verfügbar'
        }
        return 'nicht verfügbar'
      }
      if (!labels[this.tx.status] || labels[this.tx.status] === '') {
        return this.tx.status
      }
      return labels[this.tx.status]
  }

  render() { 
    return ([<div class={{ 'easycredit-tx-status-widget': true, 'manager': this.isManager, 'loading': this.loading }}>
        <span class="logo"></span>
        <span>{this.getStatusLabel()}</span>
      </div>
    ])
  }
}

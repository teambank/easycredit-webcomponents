import { Component, Prop, State, h } from '@stencil/core';
import { formatCurrency, formatDatetime, fetchTransaction, refundTransaction, captureTransaction, youngerThanOneDay } from '../../utils/utils';

@Component({
  tag: 'easycredit-merchant-manager',
  styleUrl: 'easycredit-merchant-manager.scss',
  shadow: true,
})

export class EasycreditMerchantStatusWidget {

  @State() tx: any = null
  @State() loading: boolean = false
  @State() status
  @State() submitDisabled = false
  @State() alert: {message: String, type: String}
  @State() progressItems: {
    created: String, status: String, type: String, uuid: String, message: String
  }[] = []

  @State() trackingNumber
  @State() amount

  @Prop() txId: string
  @Prop({mutable: true}) date: string

  alertElement!: HTMLElement;

  typeLabels = {
    'ORDER' : 'Bestellung',
    'CAPTURE' : 'Lieferung',
    'REFUND' : 'Rückabwicklung'
  }

  async componentWillLoad () {
    this.loadTransaction()
  }

  loadTransaction (reload = false) {
    this.loading = true
    fetchTransaction(this.txId, reload).then((transaction) => {
        if (transaction) {
          this.tx = transaction
          this.amount = parseFloat(this.tx.orderDetails.currentOrderValue)
        }
        this.loading = false
    }).catch((e) => {
      console.error(e)
      this.loading = false
    })
  }

  orderAmount () {
    return formatCurrency(this.tx.orderDetails.currentOrderValue)
    + ' / ' + formatCurrency(this.tx.orderDetails.originalOrderValue)
  }

  canShip () {
    return !this.tx.bookings.filter(b => b.type === 'CAPTURE').length
  }

  canRefund () {
    return this.tx.orderDetails.currentOrderValue > 0
  }

  showAlert (alert) {
    this.alert = alert
    
    let el
    if (el = this.alertElement) {
      el.classList.remove('easycredit-tx-alert')
      el.offsetWidth
      el.classList.add('easycredit-tx-alert')
    }
  }

  async updateTransaction () {
    this.loading = true
    try {
      if (this.status === 'REFUND') {
        await refundTransaction(this.tx.transactionId, {
          value: parseFloat(this.amount)
        })
      } else if (this.status === 'CAPTURE') {
        await captureTransaction(this.tx.transactionId, {
          trackingNumber: this.trackingNumber
        })
      }
      this.showAlert({ 
        message: 'Der Status wurde erfolgreich übermittelt.',
        type: 'success'
      })
    } catch (e) {
      this.showAlert({ 
        message: 'Die Statusübermittlung ist fehlgeschlagen. Bitte führen Sie die Statusmeldung über unser Partnerportal durch und überprüfen Sie die Logdateien.',
        type: 'error'
      })
    }
    await this.loadTransaction(true)
    this.loading = false
  }

  getProgressBarFragment () {
    if (!this.tx) {
      return
    }

    let progressItems = [ ...this.tx.bookings ]
    progressItems.push({
      created: this.tx.orderDetails.orderDate,
      status: 'DONE',
      type: 'ORDER'
    })

    let progressBar = progressItems.sort((a, b) => {
      return Date.parse(a.created) - Date.parse(b.created)
    }).map((booking, idx, arr) => {
      return ([
        <div class={{'progress': true, 'light': booking.status === 'PENDING', 'error': booking.status === 'FAILED'}}>
          <strong>{ this.typeLabels[booking.type] }</strong><br />
          <span>{ booking.created ? formatDatetime(booking.created) : 'n/a' }</span><br />
          {booking.message && booking.message.messageDE && 
            <span>{ booking.message.messageDE }<br /></span>
          }
          { (idx != arr.length -1) && <span>|</span> }
        </div>
      ])
    })

    return ([
      <div class="progress-bar">
        { progressBar }
      </div>
    ])
  }

  getInfoFragment () {
    if (!this.tx) {
        return
    }
    return ([
      <div class="transaction-info">
        <easycredit-merchant-status-widget tx-id={this.txId} is-manager="true" />
        <p>
          <strong>Kunde:</strong> { this.tx.customer.firstName } { this.tx.customer.lastName }<br />
          <strong>Kundennummer:</strong> { this.tx.customer.customerNumber }<br />
          <strong>Kontonummer:</strong> { this.tx.creditAccountNumber }<br />
          <strong>Transaktions-ID:</strong> { this.tx.transactionId }<br />
          <strong>Bestellwert:</strong> { this.orderAmount() }<br />
        </p>
      </div>   
    ])
  }

  getAlertFragment() {
    if (!this.alert) {
      return
    }
    return <p class={`easycredit-tx-alert ${this.alert.type}`} ref={(el) => this.alertElement = el as HTMLElement}>
      {this.alert.message}
    </p>
  }

  getActionsFragment () {
    if (!this.tx || (!this.canShip() && !this.canRefund())) {
        return
    }

    return ([
      <div>
        {this.getAlertFragment()}
        <input value={this.tx.transactionId} type="hidden" name="easycredit-merchant[transaction_id]" />
        <p>
          <label htmlFor="easycredit-merchant-status">Status</label><br />
          <select
            id="easycredit-merchant-status"
            onInput={(e) => this.status = (e.target as HTMLSelectElement).value }
            name="easycredit-merchant[status]"
          >
            <option value="">Bitte wählen ...</option>
            { this.canShip() &&  <option value="CAPTURE">Lieferung</option> }
            { this.canRefund() && <option value="REFUND">Rückabwicklung</option> }
          </select>
        </p>

        { this.status === 'CAPTURE' && 
          <p class="tracking-number">
            <label htmlFor="easycredit-merchant-tracking-number">Trackingnummer (Versanddienstleister)</label><br />
            <input
              id="easycredit-merchant-tracking-number"
              name="easycredit-merchant[trackingNumber]"
              type="text"
              onInput={(e) => this.trackingNumber = (e.target as HTMLInputElement).value }
              maxlength="50"
            />
          </p>   
        }

        { this.status === 'REFUND' && 
          <p class="refund">
            <span class="amount">
              <label htmlFor="easycredit-merchant-amount">Minderung um </label><br />
              <input
                id="easycredit-merchant-amount"
                name="easycredit-merchant[amount]"
                type="number"
                onInput={(e) => this.amount = (e.target as HTMLInputElement).value }
                value={this.amount}
                min="0.01"
                max={ this.tx.orderDetails.currentOrderValue.toFixed(2) }
              /> € / { formatCurrency(this.tx.orderDetails.currentOrderValue) }
            </span>
          </p>
        }

        <p>
          <button type="button" class="set_merchant_status"
            disabled={this.loading || !this.status}
            onClick={() => { this.updateTransaction() }}
          >
            Senden
          </button>
        </p>
      </div>
    ])
  }

  getNotAvailableFragment () {
    if (this.tx) {
      return
    }

    if (youngerThanOneDay(this.date)) {
      return [
        <span>
          Die Transaktion <strong>{ this.txId }</strong> ist noch nicht verfügbar. 
          Es kann bis zu einem Tag dauern bis die Transaktion angezeigt wird.
        </span>
      ]
    }

    return [
      <span>
        Die Transaktion <strong>{ this.txId }</strong> ist nicht vorhanden. 
        Bitte loggen Sie sich im <a href="https://partner.easycredit-ratenkauf.de/portal/">Partnerportal</a> ein oder kontaktieren Sie unseren Partnerservice unter 0911 5390-2726 oder <a href="mailto:partnerservice.ratenkauf@teambank.de">per E-Mail</a>.
      </span>
    ]
  }

  render() { 
    return ([<div class={{'easycredit-tx-manager': true, 'loading': this.loading}}>
        <div class="spinner" />
        {this.getInfoFragment()}
        {this.getProgressBarFragment()}
        {this.getActionsFragment()}

        {this.getNotAvailableFragment()}
      </div>
    ])
  }
}

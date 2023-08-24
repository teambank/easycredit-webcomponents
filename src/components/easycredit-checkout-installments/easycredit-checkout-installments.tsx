import { Component, Prop, State, Listen, Watch, Event, EventEmitter, h } from '@stencil/core';
import { formatCurrency, sendFeedback } from '../../utils/utils';

@Component({
  tag: 'easycredit-checkout-installments',
  styleUrl: 'easycredit-checkout-installments.scss'
})

export class EasycreditCheckoutInstallments {

  @Prop({ mutable: true }) showMoreButtonText: string = 'Weitere Raten anzeigen +'
  @Prop() installments
  @Prop() rows: number = 5

  @State() collapsed: boolean = true
  @State() collapsing: boolean = false
  @State() _installments
  @State() selectedInstallmentValue: number

  @Listen('selectedInstallment')
  selectedInstallmentHandler(e) {
    this.selectedInstallmentValue = e.detail
  }

  @Watch('installments')
  parseInstallmentsProp(newValue: string) {
    if (newValue) this._installments = JSON.parse(newValue);
  }

  installmentsBase!: HTMLElement;

  async componentWillLoad () {
    this.parseInstallmentsProp(this.installments);
  }
  componentDidLoad () {
    if (!this._installments) {
      return
    }

    this.selectFirstOption()
  }

  @Event() selectedInstallment: EventEmitter<string>

  selectFirstOption () {
    let initialOption = this.installmentsBase.querySelector('input:first-child') as HTMLInputElement
    initialOption.checked = true
    this.selectedInstallment.emit(initialOption.value)
  }
  listBase (): any[] {
    return this._installments.slice(0, this.rows)
  }
  listExtended (): any[] {
    return this._installments.slice(this.rows)
  }
  listExtendedMaxHeight () {
    var maxHeight = ((this._installments.length - this.rows) * 42)
    return maxHeight + 'px'
  }
  listClasses (cls) {
    cls += this.collapsing ? ' collapsing' : '';
    cls += this.collapsed ? ' collapsed' : '';
    return cls
  }

  toggleList () {
    sendFeedback(this, { component: 'EasycreditCheckoutInstallments', action: 'showMore' })
    this.collapsing = !this.collapsing;
    setTimeout(() => this.collapsing = !this.collapsing, 350);
    setTimeout(() => this.collapsed = !this.collapsed, 350);
    this.showMoreButtonText = !this.collapsed ? 'Weitere Raten anzeigen +' : 'Weniger Raten anzeigen -';

    if ( this._installments.findIndex((item) => item.numberOfInstallments == this.selectedInstallmentValue) >= this.rows ) {
      this.selectFirstOption()
    }
  }

  onInstallmentSelect (e) {
    let t = e.target as HTMLInputElement; 
    this.selectedInstallment.emit(t.value)
    sendFeedback(this, { component: 'EasycreditCheckoutInstallments', action: 'selectInstallment', numberOfInstallments: t.value })
  }

  getInstallmentFragment (installment: any) {
    return <li>
      <input 
        id={`easycreditInstallment${installment.numberOfInstallments}`} 
        type="radio" name="easycredit-duration" 
        value={installment.numberOfInstallments} 
        onInput={(e) => this.onInstallmentSelect(e) } 
      />
      <label htmlFor={`easycreditInstallment${installment.numberOfInstallments}`}>
        <span>{ installment.numberOfInstallments } Monate</span> <span>{ formatCurrency(installment.installment) } / Monat</span>
      </label>
    </li>
  }

  getMoreListFragment () {
      if (this._installments.length > this.rows) {
        return <ul class="ec-checkout__instalments actions">
          <li class={this.listClasses('more')}  onClick={() => this.toggleList()}>
            { this.showMoreButtonText }
          </li>
        </ul>
      }
  }

  render () {
    if (!this._installments) {
      return
    }
    return <div>
      <ul class={{ 'ec-checkout__instalments': true, 'base': true, 'last': this._installments.length <= this.rows }} ref={(el) => this.installmentsBase = el as HTMLElement}>
        { this.listBase().map(installment => this.getInstallmentFragment(installment)) }
      </ul>
      <ul class={this.listClasses('ec-checkout__instalments extended')}  style={{ maxHeight: this.listExtendedMaxHeight() }}>
        { this.listExtended().map(installment => this.getInstallmentFragment(installment)) }
      </ul>
      {this.getMoreListFragment()}
    </div>
  }
}

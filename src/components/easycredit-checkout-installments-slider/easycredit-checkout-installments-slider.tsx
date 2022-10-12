import { Component, Prop, State, Listen, Watch, Event, EventEmitter, h } from '@stencil/core';
import { formatCurrency } from '../../utils/utils';

@Component({
  tag: 'easycredit-checkout-installments-slider',
  styleUrl: 'easycredit-checkout-installments-slider.scss'
})

export class EasycreditCheckoutInstallmentsSlider {

  @Prop() installments

  @State() _installments
  @State() selectedInstallmentAmount: number
  @State() selectedInstallmentValue: number

  @Listen('selectedInstallment')
  selectedInstallmentHandler(e) {
    this.selectedInstallmentAmount = this._installments[e.detail].installment
    this.selectedInstallmentValue = this._installments[e.detail].numberOfInstallments
    this.setInstallmentSliderBG()
  }

  @Watch('installments')
  parseInstallmentsProp(newValue: string) {
    if (newValue) this._installments = JSON.parse(newValue);
  }

  installmentsSlider!: HTMLInputElement;

  async componentWillLoad () {
    this.parseInstallmentsProp(this.installments);
  }
  componentDidLoad () {
    if (!this._installments) {
      return
    }

    // console.log(this._installments)
    this.selectFirstOption()
  }

  @Event() selectedInstallment: EventEmitter<string>

  selectFirstOption () {
    let initialValue = Math.floor(this._installments.length / 2)
    this.installmentsSlider.value = initialValue.toString()
    this.selectedInstallment.emit(initialValue.toString())
  }

  onInstallmentSelect (e) {
    let t = e.target as HTMLInputElement;
    this.selectedInstallment.emit(t.value)
  }
  onInstallmentDecrease () {
    let newValue = Number(this.installmentsSlider.value) - 1
    if ( newValue < 0 ) {
      return
    }

    this.installmentsSlider.value = newValue.toString()
    this.selectedInstallment.emit(newValue.toString())
  }
  onInstallmentIncrease () {
    let newValue = Number(this.installmentsSlider.value) + 1
    if ( newValue > (this._installments.length - 1) ) {
      return
    }

    this.installmentsSlider.value = newValue.toString()
    this.selectedInstallment.emit(newValue.toString())
  }

  setInstallmentSliderBG () {
    let e = this.installmentsSlider

    var value = ( Number(e.value) - Number(e.min) ) / ( Number(e.max) - Number(e.min) ) * 100
    this.installmentsSlider.style.background = 'linear-gradient(to right, #0066B3 0%, #0066B3 ' + value + '%, #E5EAEE ' + value + '%, #E5EAEE 100%)'
  }

  render () {
    if (!this._installments) {
      return
    }
    return <div class="ec-checkout__instalments-slider">
      <div class="ec-checkout__header">
        <div class="ec-checkout__logo"></div>
      </div>
 
      <h3>Ihre monatliche Wunschrate</h3>

      <div class="ec-checkout__slider-price">
        { formatCurrency(this.selectedInstallmentAmount) }
      </div>

      <div class="ec-checkout__slider-frame">
        <input
          type="button"
          class="ec-checkout__icon-minus"
          onClick={this.onInstallmentDecrease.bind(this)}
        />
        <input
          type="range"
          min="0"
          max={this._installments.length - 1}
          value="0"
          onInput={(e) => this.onInstallmentSelect(e) }
          ref={(el) => this.installmentsSlider = el as HTMLInputElement}
        />
        <input
          type="button"
          class="ec-checkout__icon-plus"
          onClick={this.onInstallmentIncrease.bind(this)}
        />
      </div>

      <input
        type="hidden"
        name="easycredit-duration"
        value={ this.selectedInstallmentValue }
      />

      <div class="ec-checkout__rates">
        in { this.selectedInstallmentValue } Raten
      </div>
    </div>
  }
}

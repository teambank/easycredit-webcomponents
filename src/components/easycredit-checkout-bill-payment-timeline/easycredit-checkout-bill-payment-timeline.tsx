import { Component, h } from '@stencil/core';
// import { applyAssetsUrl, getAssetUrl } from '../../utils/utils';

@Component({
    tag: 'easycredit-checkout-bill-payment-timeline',
    styleUrl: 'easycredit-checkout-bill-payment-timeline.scss'
})

export class EasycreditCheckoutBillPaymentTimeline {
    render() {
        return [
            <div class="ec-checkout__timeline">
                <div class="ec-checkout__animation-information">
                    <span>Heute<br />bestellen</span>
                    <span>in <strong>30 Tagen</strong><br />bezahlen</span>
                </div>

                <div class="ec-checkout__animation">
                    <span class="ec-checkout__animation-start"></span>
                    <span class="ec-checkout__animation-bullets">
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '0' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '1' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '2' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '3' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '4' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '5' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '6' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '7' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '8' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '9' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '10' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '11' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '12' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '13' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '14' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '15' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '16' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '17' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '18' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '19' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '20' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '21' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '22' }}></span>
                        <span class="ec-checkout__animation-bullet" style={{ '--bullet-index': '23' }}></span>
                    </span>
                    <span class="ec-checkout__animation-end"></span>
                </div>
            </div>
        ]
    }
}
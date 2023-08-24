import { Component, State, h } from '@stencil/core';
import { applyAssetsUrl, sendFeedback } from '../../utils/utils';

@Component({
  tag: 'easycredit-box-top',
  styleUrl: 'easycredit-box-top.scss',
  shadow: true,
})

export class EasycreditBoxTop {

  @State() slideIndex = 0
  @State() isScrolled = false

  connectedCallback() {
    applyAssetsUrl(EasycreditBoxTop)
  }

  componentWillLoad() {

    setInterval(() => {
      this.slideIndex = (this.slideIndex === 0) ? this.slideIndex + 1 : 0
    }, 5000);
    document.addEventListener('scroll', () => {
      this.isScrolled = (window.scrollY >= 50)
    })
  }

  componentDidLoad () {
    sendFeedback(this, { component: 'EasycreditBoxTop', action: 'componentDidLoad' })
  }

  render() { 
    return ([
      <div class={{ 'ec-box-top': true, 'slide-1': (this.slideIndex == 1), 'scrolled': this.isScrolled }}>
        <div class="ec-box-top__slider">
            <div class={{ 'ec-box-top__slide': true, 'slide-1': true, 'active': this.slideIndex === 0}}>
                <div class="ec-box-top__content">
                    <div class="ec-box-top__content-logo"></div>
                    <div class="ec-box-top__content-text">
                        <span>Ganz entspannt in Raten zahlen.</span> <span class="secondary">Hier im Shop schon ab 200€ in Raten zahlen.</span>
                    </div>

                    <div class="ec__circle-badge ec__circle-badge-xs">Flexibel <span>Sofort</span> Transparent</div>
                </div>
            </div>

            <div class={{ 'ec-box-top__slide': true, 'slide-2': true, 'active': this.slideIndex === 1}}>
                <div class="ec-box-top__content">
                    <div class="ec-box-top__content-text">
                        <span class="secondary">Hier im Shop schon ab 200€ in Raten zahlen.</span>
                    </div>

                    <div class="ec__circle-badge ec__circle-badge-xs">Flexibel <span>Sofort</span> Transparent</div>
                </div>
            </div>
        </div>
      </div>
    ])
  }
} 

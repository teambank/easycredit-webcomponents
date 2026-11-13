import { Component, State, h } from '@stencil/core';
import { applyAssetsUrl } from '../../utils/utils';
import { installmentCostNotice } from '../../utils/cost-notice';

@Component({
  tag: 'easycredit-box-top',
  styleUrl: 'easycredit-box-top.scss',
  shadow: true,
})

export class EasycreditBoxTop {

  @State() slideIndex = 0
  @State() isScrolled = false
  @State() noticeVisible = false

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

  private renderShopLine() {
    return (
      <span class="secondary">
        <span class="secondary-default">Hier im Shop schon ab 200€ in Raten zahlen.</span>
        <span class="secondary-notice">{installmentCostNotice()}</span>
      </span>
    )
  }

  private onBarClick() {
    if (window.matchMedia('(hover: hover)').matches) {
      return
    }
    this.noticeVisible = !this.noticeVisible
  }

  render() { 
    return ([
      <div class={{ 'ec-box-top': true, 'slide-1': (this.slideIndex == 1), 'scrolled': this.isScrolled, 'show-notice': this.noticeVisible }} onClick={() => this.onBarClick()}>
        <div class="ec-box-top__slider">
            <div class={{ 'ec-box-top__slide': true, 'slide-1': true, 'active': this.slideIndex === 0}}>
                <div class="ec-box-top__content">
                    <div class="ec-box-top__content-logo"></div>
                    <div class="ec-box-top__content-text">
                        <span>Ganz entspannt in Raten zahlen.</span> {this.renderShopLine()}
                    </div>

                    <div class="ec__circle-badge ec__circle-badge-xs">Flexibel <span>Sofort</span> Transparent</div>
                </div>
            </div>

            <div class={{ 'ec-box-top__slide': true, 'slide-2': true, 'active': this.slideIndex === 1}}>
                <div class="ec-box-top__content">
                    <div class="ec-box-top__content-text">
                        {this.renderShopLine()}
                    </div>

                    <div class="ec__circle-badge ec__circle-badge-xs">Flexibel <span>Sofort</span> Transparent</div>
                </div>
            </div>
        </div>
      </div>
    ])
  }
} 

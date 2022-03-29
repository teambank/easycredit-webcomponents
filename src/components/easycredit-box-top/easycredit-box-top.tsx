import { Component, State, h } from '@stencil/core';

@Component({
  tag: 'easycredit-box-top',
  styleUrl: 'easycredit-box-top.scss',
  shadow: true,
})

export class EasycreditBoxTop {

  @State() slideIndex = 0
  @State() isScrolled = false

  componentWillLoad() {

    setInterval(() => {
      this.slideIndex = (this.slideIndex === 0) ? this.slideIndex + 1 : 0
    }, 5000);
    document.addEventListener('scroll', () => {
      this.isScrolled = (window.scrollY >= 50)
    })
  }

  render() { 
    return ([
      <div class={{ 'ec-box-top': true, 'orange': (this.slideIndex == 1), 'scrolled': this.isScrolled }}>
        <div class="ec-box-top__slider">
            <div class={{ 'ec-box-top__slide': true, 'slide-1': true, 'active': this.slideIndex === 0}}>
                <div class="ec-box-top__content">
                    <div class="ec-box-top__content-logo">
                    </div>
                    <div class="ec-box-top__content-text">
                        Ganz entspannt in Raten zahlen.
                    </div>
                </div>
            </div>
            <div class={{ 'ec-box-top__slide': true, 'slide-2': true, 'active': this.slideIndex === 1}}>
                <div class="ec-box-top__content">
                    <div class="ec-box-top__content-logo">
                    </div>
                    <div class="ec-box-top__content-text">
                        Hier im Shop schon ab 200€ in Raten zahlen.
                    </div>
                </div>
            </div>
        </div>
      </div>
    ])
  }
}
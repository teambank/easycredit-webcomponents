import { Component, Method, Prop, h } from '@stencil/core';
import { applyAssetsUrl, getAssetUrl } from '../../utils/utils';

@Component({
  tag: 'easycredit-box-modal',
  styleUrl: 'easycredit-box-modal.scss',
  shadow: true,
})

export class EasycreditBoxModal {

  @Prop({mutable: true}) src: string
  @Prop({mutable: true}) snoozeFor: number
  @Prop({mutable: true}) delay: number
  @Prop({mutable: true}) isOpen: boolean = false

  connectedCallback() {
    applyAssetsUrl(EasycreditBoxModal)
  }

  async componentWillLoad () {
    if (this.delay > 0 && !this.isSnoozed()) {
      window.setTimeout(()=>{
        this.isOpen = true
      }, this.delay)
    }
  }

  isSnoozed() {
    var snoozed
    try {
      snoozed = localStorage.getItem('easycredit-modal-snoozed')
    } catch (e) {}
    console.log((Date.now() - Number(snoozed))+' < '+this.snoozeFor * 1000)
    return ((Date.now() - Number(snoozed)) < this.snoozeFor * 1000)
  }

  backgroundSrc() {
    if (!this.src) {
      return getAssetUrl('/easycredit-components/assets/motiv-online-floor.jpg')
    } else {
      return this.src
    }
  }

  @Method() async toggle () {
    this.isOpen = !this.isOpen

    if (!this.isOpen && this.snoozeFor) {
      try {
        localStorage.setItem('easycredit-modal-snoozed', Date.now().toString())
      } catch (e) {}      
    }
  }

  render() {
    return ([
      <div class={{ 'ec-box-modal': true, 'show': this.isOpen }}>
        <div class="ec-box-modal__inner">
          <div class="ec-box-modal__close" onClick={() => this.toggle()}></div>

          <div class="ec-box-modal__image" style={{backgroundImage: `url(${this.backgroundSrc()})`}}>
            <div class="circle"></div>
            <div class="circle circle-secondary"></div>

            <div class="ec-box-modal__image-logo"></div>
          </div>

          <div class="ec-box-modal__content">
            <div class="ec__circle-badge">Flexibel <span>Sofort</span> Transparent</div>

            <div class="ec-box-modal__content-heading">
                <span>Ganz entspannt</span> in Raten zahlen.
            </div>
            <div class="ec-box-modal__content-description">
              Einfach im Bezahlvorgang easyCredit-Ratenkauf und Wunschrate wählen.
            </div>

            <div class="ec-box-modal__content-button">
                <a class="btn btn-primary" href="https://www.easycredit-ratenkauf.de/" target="_blank">Mehr erfahren</a>
            </div>

            <div class="ec-box-modal__content-logo-finanzgruppe"></div>
          </div>
        </div>

        <div class="ec-box-modal__backdrop" onClick={() => this.toggle()}></div>
      </div>
    ])
  }
}

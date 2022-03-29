import { Component, Method, Prop, h } from '@stencil/core';

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
              <div class="ec-box-modal__close" onClick={() => this.toggle()}>
              </div>

              <div class="ec-box-modal__image">
                  <div class="ec-box-modal__image-logo"></div>
                  <div class="ec-box-modal__image-heading">
                      <span>Ganz entspannt</span> in Raten zahlen.
                  </div>

                  <div class={{ 'ec-box-modal__image-product': true, 'empty': !this.src }}>
                      <img src={this.src} />
                  </div>

                  <div class="ec-box-modal__image-logo-secondary"></div>
              </div>

              <div class="ec-box-modal__content">
                  <div class="ec-box-modal__content-heading">
                      Online Shoppen und bequem in Raten zahlen!
                  </div>
                  <div class="ec-box-modal__content-description">
                      Der ratenkauf by easyCredit bietet Ihnen die Möglichkeit hier im Online-Shop bequem und einfach in Raten zu zahlen. Direkt von zu Hause und ganz ohne Risiko. Denn zuerst erhalten Sie Ihre Bestellung und bezahlen später in Ihren Wunschraten.
                  </div>

                  <div class="ec-box-modal__price">
                      <div class="ec-box-modal__price-start">Einfach im Bezahlvorgang ratenkauf by easyCredit und Wunschrate wählen.</div>
                      { /*
                      <div class="ec-box-modal__price-start">schon ab</div>
                      <div class="ec-box-modal__price-per-month"><span>44€</span><span class="month">im<br>Monat</span></div>
                      */ }
                  </div>

                  <div class="ec-box-modal__content-heading">
                      Sofort - Flexibel - Transparent
                  </div>
                  { /*
                  <div class="ec-box-modal__content-fine-print">
                      Repräsentatives Beispiel: Sollzinssatz 8,53 % p.a. fest für die gesamte Laufzeit, effektiver Jahreszins 8,88 %, Bestellwert 500,00 EUR, Vertragslaufzeit 12 Monate, Gesamtbetrag 523,25 EUR, monatliche Rate 44,00 EUR, letzte Rate 39,25 EUR. Anbieter: Testshop3 Ratenkauf, Muster-Strasse 1, 90890 Musterhausen
                  </div>
                  */ }
              </div>
          </div>

					<div class="ec-box-modal__backdrop" onClick={() => this.toggle()}></div>
      </div>
    ])
  }
}

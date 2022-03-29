import { Component, Method, Prop, h } from '@stencil/core';

@Component({
  tag: 'easycredit-box-flash',
  styleUrl: 'easycredit-box-flash.scss',
  shadow: true,
})

export class EasycreditBoxFlash {

  @Prop() src: string
  @Prop() isOpen: boolean = false

  @Method() async toggle () {
    this.isOpen = !this.isOpen
  }

  render() { 
    return ([
      <div class={{ 'ec-box-flash': true, 'active': this.isOpen }} onClick={() => this.toggle()}>
        <div class="ec-box-flash__inner">
            <div class="ec-box-flash__close">
            </div>

            <div class="ec-box-flash__image">
                <div class="ec-box-flash__image-logo"></div>

                <div class="ec-box-flash__price">
                    <div class="ec-box-flash__price-start">Einfach im Bezahlvorgang ratenkauf by easyCredit und Wunschrate wählen.</div>
                    {/*
                    <div class="ec-box-flash__price-start">schon ab</div>
                    <div class="ec-box-flash__price-per-month">
                        <span>44€</span><span class="month">im<br>Monat</span>
                    </div>
                    */}
                </div>

                <div class={{ 'ec-box-flash__image-product': true, 'empty': !this.src }}>
                    <img src={this.src} />
                </div>

                <div class="ec-box-flash__image-logo-secondary"></div>
            </div>

            <div class="ec-box-flash__content">
                <div class="ec-box-flash__content-heading">
                    Ganz entspannt in Raten zahlen.
                </div>

                <div class="ec-box-flash__content-description">
                    Der ratenkauf by easyCredit bietet Ihnen die Möglichkeit hier im Online-Shop bequem und einfach in Raten zu zahlen. Direkt von zu Hause und ganz ohne Risiko. Denn zuerst erhalten Sie Ihre Bestellung und bezahlen später in Ihren Wunschraten.
                </div>

                <div class="ec-box-flash__content-heading">
                    Sofort - Flexibel - Transparent
                </div>
                {/* 
                <div class="ec-box-flash__content-fine-print">
                   Repräsentatives Beispiel: Sollzinssatz 8,53 % p.a. fest für die gesamte Laufzeit, effektiver Jahreszins 8,88 %, Bestellwert 500,00 EUR, Vertragslaufzeit 12 Monate, Gesamtbetrag 523,25 EUR, monatliche Rate 44,00 EUR, letzte Rate 39,25 EUR. Anbieter: Testshop3 Ratenkauf, Muster-Strasse 1, 90890 Musterhausen
                </div>
                */}
            </div>
        </div>
      </div>
    ])
  }
}
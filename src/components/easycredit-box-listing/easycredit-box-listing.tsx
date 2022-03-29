import { Component, Method, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'easycredit-box-listing',
  styleUrl: 'easycredit-box-listing.scss',
  shadow: true,
})

export class EasycreditBoxListing {

  @Prop() src: string

  @State() isOpen = false
  @Method() async toggle () {
    this.isOpen = !this.isOpen
  }

  render() { 
    return ([
        <div class="ec-box-listing">
            <div class="ec-box-listing__inner">
                <div class="ec-box-listing__image">
                    <div class="ec-box-listing__image-logo">
                    </div>

                    <div class="ec-box-listing__image-heading">
                        <span>Ganz entspannt</span> <br />in Raten zahlen.
                    </div>

                    <div class={{ 'ec-box-listing__image-product': true, 'empty': !this.src }}>
                        <img src={this.src} />
                    </div>
                </div>

                <div class="ec-box-listing__content">
                    <div class="ec-box-listing__content-heading">
                        Online Shoppen und bequem in Raten zahlen!
                    </div>
                    <div class="ec-box-listing__content-description">
                        Der ratenkauf by easyCredit bietet Ihnen die Möglichkeit hier im Online-Shop bequem und einfach in Raten zu zahlen. Direkt von zu Hause und ganz ohne Risiko. Denn zuerst erhalten Sie Ihre Bestellung und bezahlen später in Ihren Wunschraten.
                    </div>
                </div>
            </div>

            <div class="ec-box-listing__badge">
                Einfach im Bezahlvorgang ratenkauf by easyCredit wählen.
            </div>

            { /*<div class="ec-box-listing__price active">
                <div class="ec-box-listing__price-start">Einfach im Bezahlvorgang ratenkauf by easyCredit wählen.</div>
                <div class="ec-box-listing__price-start">schon ab</div>
                <div class="ec-box-listing__price-per-month"><span>44€</span><span class="month">im<br />Monat</span></div>
            </div>*/ }
        </div>
    ])
  }
}
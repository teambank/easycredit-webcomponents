import { Component, Method, Prop, State, h } from '@stencil/core';
import { applyAssetsUrl, getAssetUrl } from '../../utils/utils';

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

  connectedCallback() {
    applyAssetsUrl(EasycreditBoxListing)
  }

  backgroundSrc() {
    if (!this.src) {
      return getAssetUrl('/easycredit-components/assets/motiv-online-floor.jpg')
    } else {
      return this.src
    }
  }

  render() { 
    return ([
        <div class="ec-box-listing"> 
            <div class="ec-box-listing__image" style={{backgroundImage: `url(${this.backgroundSrc()})`}}>
                <div class="circle"></div>
                <div class="circle circle-secondary"></div>

                <div class="ec-box-listing__image-logo"></div>

                {/*
                <div class="ec__circle-badge ec__circle-badge-orange ec__circle-badge-sm">Flexibel <span>Sofort</span> Transparent</div>
                */}

                <div class="ec-box-listing__image-heading">
                    Ganz entspannt <br />in Raten zahlen.
                </div>

                <div class="ec-box-listing__image-description">
                    Einfach im Bezahlvorgang easyCredit-Ratenkauf wählen.
                </div>
            </div>

            <div class="ec-box-listing__content">
                <div class="ec-box-listing__content-heading">
                    Online Shoppen und bequem in Raten zahlen!
                </div>

                <div class="ec-box-listing__content-description">
                    Der easyCredit-Ratenkauf bietet Ihnen die Möglichkeit hier im Online-Shop bequem und einfach in Raten zu zahlen. Direkt von zu Hause und ganz ohne Risiko. Denn zuerst erhalten Sie Ihre Bestellung und bezahlen später in Ihren Wunschraten.
                </div>

                <div class="ec-box-listing__content-button">
                    <a class="btn btn-primary" href="https://www.easycredit-ratenkauf.de/" target="_blank">Mehr erfahren</a>
                </div>

                <div class="ec-box-listing__content-logo-finanzgruppe"></div>
            </div>
        </div>
    ])
  }
}

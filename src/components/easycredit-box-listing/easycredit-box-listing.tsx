import { Component, Method, Prop, State, h } from '@stencil/core';
import { applyAssetsUrl, getAssetUrl, sendFeedback } from '../../utils/utils';

@Component({
  tag: 'easycredit-box-listing',
  styleUrl: 'easycredit-box-listing.scss',
  shadow: true,
})

export class EasycreditBoxListing {

  @Prop() src: string

  listingElement!: HTMLElement
  descTextDefault: string = 'Der easyCredit-Ratenkauf bietet Ihnen die Möglichkeit hier im Online-Shop bequem und einfach in Raten zu zahlen. Direkt von zu Hause und ganz ohne Risiko. Denn zuerst erhalten Sie Ihre Bestellung und bezahlen später in Ihren Wunschraten.'
  descTextDefaultShort: string = 'Der easyCredit-Ratenkauf bietet Ihnen die Möglichkeit hier im Online-Shop bequem und einfach in Raten zu zahlen. Direkt von zu Hause und ganz ohne Risiko.'

  @State() listingLayout: string = ''
  @State() descText: string = this.descTextDefault

  @State() isOpen = false
  @Method() async toggle () {
    this.isOpen = !this.isOpen
  }

  connectedCallback() {
    applyAssetsUrl(EasycreditBoxListing)
  }

  componentDidLoad () {
    sendFeedback(this, { component: 'EasycreditBoxListing', action: 'componentDidLoad' })
  }

  componentDidRender() {
    this.setListingLayout();
    this.setDescText();
  }

  setListingLayout(): void {
    if ( !this.listingElement ) {
      return;
    }
    this.listingLayout = this.listingElement.getBoundingClientRect().height < 400 ? 'small' : '';
  }

  private setDescText(): void {
    if ( this.listingLayout === 'small' ) {
      this.descText = this.descTextDefaultShort;
    }
  }

  backgroundSrc() {
    if (!this.src) {
      return getAssetUrl('/easycredit-components/assets/motiv-leyla.jpg')
    } else {
      return this.src
    }
  }

  render() { 
    return ([
        <div class={{
          'ec-box-listing': true,
          ['layout-' + this.listingLayout]: this.listingLayout !== '',
        }} ref={(el) => this.listingElement = el as HTMLElement}>
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
                    { this.descText }
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

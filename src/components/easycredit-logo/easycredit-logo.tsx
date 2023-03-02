import { Component, Prop, h } from '@stencil/core';
import { applyAssetsUrl, getAssetUrl } from '../../utils/utils';

@Component({
  tag: 'easycredit-logo',
  styleUrl: 'easycredit-logo.scss',
  shadow: false,
})

export class EasycreditLogo {

  @Prop({ mutable: true }) alt: string = 'easyCredit-Ratenkauf - Einfach. Fair. In Raten zahlen.';

  connectedCallback() {
    applyAssetsUrl(EasycreditLogo)
  }

  render() { 
    return ([
      <img src={getAssetUrl('/easycredit-components/assets/ratenkauf-logo.svg')} alt={this.alt} class="ec-logo" />
    ])
  }
}

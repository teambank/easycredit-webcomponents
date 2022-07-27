import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'easycredit-logo',
  styleUrl: 'easycredit-logo.scss',
  shadow: true,
})

export class EasycreditLogo {

  @Prop({ mutable: true }) alt: string = 'ratenkauf by easyCredit - Einfach. Fair. In Raten zahlen.';

  render() { 
    return ([
      <img src="https://ratenkauf.easycredit.de/api/resource/webcomponents/v3/easycredit-components/assets/ratenkauf-logo.svg" alt={this.alt} />
    ])
  }
}

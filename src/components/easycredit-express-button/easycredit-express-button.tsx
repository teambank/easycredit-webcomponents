import { Component, Prop, State, Element, Listen, h } from '@stencil/core';

@Component({
  tag: 'easycredit-express-button',
  styleUrl: 'easycredit-express-button.scss',
  shadow: true,
})

export class EasycreditExpressButton {

  @Prop() link: string = 'https://www.easycredit.de/ratenkauf-by-easycredit'
  @Prop() bgBlue: boolean = false
  @Prop() fullWidth: boolean = false

  @State() rate: string = '21,50€'
  @State() buttonOpacity: string = '0'
  @State() buttonWidth: string = '100%'
  @State() buttonText: string = 'Jetzt finanzieren ab'
  @State() buttonTextWidth: string = 'auto'

  /*
  @Listen('resize', { target: 'window' })
  handleResize() {
    this.renderButton()
  }
  */

  @Element() element: HTMLElement;
  
  modal!: HTMLEasycreditModalElement;

  @Listen('openModal')
  openModalHandler () {
    this.modal.open()
  }

  componentDidRender () {
    this.renderButton()
  }

  async renderButton () {
    await this.setButtonText()
    await this.setButtonWidth()
    await this.setButtonTextWidth()
    this.buttonOpacity = '1'
  }

  getButtonTextWidth () {
    var textFinancing: HTMLElement = this.element.shadowRoot.querySelector('.financing');
    var textRate: HTMLElement = this.element.shadowRoot.querySelector('.rate');

    widthTotal = null;
    if ( textFinancing && textRate ) {
      var widthTotal = textFinancing.offsetWidth + textRate.offsetWidth;
    }

    return widthTotal;
  }
  getButtonWidth () {
    var button: HTMLElement = this.element.shadowRoot.querySelector('.ec-express-button__btn__main');
    var logo: HTMLElement = this.element.shadowRoot.querySelector('.logo');
    var textWidth = this.getButtonTextWidth();

    widthTotal = null;
    if ( button && logo && textWidth ) {
      var widthTotal = parseInt(window.getComputedStyle(button, null).getPropertyValue('padding-left'), 10) + parseInt(window.getComputedStyle(button, null).getPropertyValue('padding-right'), 10) + logo.offsetWidth + textWidth;
    }

    return widthTotal;
  }

  setButtonText () {
    var component: HTMLElement = this.element.shadowRoot.querySelector('.ec-express-button');
    var buttonWidth = this.getButtonWidth();

    if ( component && buttonWidth ) {
      if ( component.offsetWidth < buttonWidth ) {
        this.buttonText = 'Ab';
      }
    }
  }
  setButtonWidth () {
    var buttonWidth = this.getButtonWidth();

    if ( buttonWidth ) {
      this.buttonWidth = buttonWidth + 'px';
    }
  }
  setButtonTextWidth () {
    var textWidth = this.getButtonTextWidth();

    if ( textWidth ) {
      this.buttonTextWidth = textWidth + 'px';
    }
  }

  getModalFragment () {
    return ([
      <easycredit-modal ref={(el) => this.modal = el as HTMLEasycreditModalElement}>
        <div slot="heading"><div style={{ textAlign: 'center' }}>Payment Terminal</div></div>
        <div slot="content"><div style={{ textAlign: 'center' }}>...</div></div>
      </easycredit-modal>
    ])
  }

  render() { 
    return ([
        <div class="ec-express-button" style={{ opacity: this.buttonOpacity }}>
          <div class={{ "ec-express-button__btn": true, "blue": this.bgBlue, "full-width": this.fullWidth }} style={{ width: this.buttonWidth }}>
            <a class="ec-express-button__btn__main" onClick={() => this.modal.open()}>
              <div class="logo"></div>
              <div class="ec-express-button__btn__main__inner" style={{ flexBasis: this.buttonTextWidth, width: this.buttonTextWidth }}>
                <span class="financing">{ this.buttonText }&nbsp;</span>
                <span class="rate">{ this.rate } / Monat</span>
              </div>
            </a>

            { this.getModalFragment() }
          </div>

          <a class="ec-express-button__link" target="_blank" href={ this.link } style={{ width: this.buttonWidth }}>
            easyCredit-Ratenkauf - der einfachste Ratenkauf Deutschlands.<br /><strong>Mehr erfahren</strong>
          </a>
        </div>
    ])
  }
}

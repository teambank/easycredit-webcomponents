import { Component, Prop, h, State, Element } from '@stencil/core';
import { sendFeedback } from '../../utils/utils'
import { applyAssetsUrl } from '../../utils/utils';
import { METHODS } from '../../types';

@Component({
  tag: 'easycredit-infopage',
  styleUrl: 'easycredit-infopage.scss',
  shadow: true,
})

export class EasycreditInfopage {
  @Prop({ mutable: true }) paymentTypes: string;
  @Prop() variant: 'default' | 'enhanced' = 'default';

  @State() selectedPaymentType: METHODS;
  @State() availablePaymentTypes: METHODS[] = [];

  @Element() el!: HTMLElement;

  connectedCallback() {
    applyAssetsUrl(EasycreditInfopage)
  }

  switchPaymentType(paymentType: METHODS) {
    this.selectedPaymentType = paymentType;
    sendFeedback(this, { component: 'EasycreditInfopage', action: 'switchPaymentType', paymentType: this.selectedPaymentType });
  }

  async componentWillLoad() {
    // Parse available payment types
    this.availablePaymentTypes = this.paymentTypes 
      ? this.paymentTypes.split(',').map(type => type.trim() as METHODS)
      : [METHODS.INSTALLMENT];

    // Set initial selected payment type
    if (this.availablePaymentTypes.length === 1) {
      // If only one payment type is available, select that one
      this.selectedPaymentType = this.availablePaymentTypes[0];
    } else {
      // If multiple or no payment types specified, default to INSTALLMENT
      this.selectedPaymentType = METHODS.INSTALLMENT;
    }
  }

  // Helper method to check if both payment types are available
  hasBothPaymentTypes(): boolean {
    return this.availablePaymentTypes.length > 1;
  }

  private scrollToSection(sectionId: string) {
    const host = this.el;
    const element = host.shadowRoot?.querySelector(`#${sectionId}`);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      // Add an offset of 20 pixels to account for any fixed headers or spacing
      const OFFSET = 50;
      const scrollPosition = rect.top - OFFSET;
      
      // Check if we're inside a modal
      const modalContent = host.closest('easycredit-modal')?.shadowRoot?.querySelector('.ec-modal');
      if (modalContent) {
        modalContent.scrollTo({
          top: modalContent.scrollTop + scrollPosition,
          behavior: 'smooth'
        });
      } else {
        // Fallback to window scroll if not in modal
        window.scrollTo({
          top: window.scrollY + scrollPosition,
          behavior: 'smooth'
        });
      }

      // Send feedback for analytics
      sendFeedback(this, { 
        component: 'EasycreditInfopage', 
        action: 'scrollToSection', 
        sectionId: sectionId 
      });
    }
  }

  getIntroFragment() {
    return [
      <div>
        {this.selectedPaymentType === METHODS.INSTALLMENT && (
          <div>
            <h1>Ganz entspannt in Raten zahlen.</h1>
            <p>
              Sofort - Flexibel - Transparent. 
              Mit easyCredit-Ratenkauf profitieren Sie gleich mehrfach von einer bequemen und fairen Ratenzahlung. 
              Ganz ohne versteckte Kosten, Gebühren und lästigen Papierkram. 
              Wählen Sie im Bezahlvorgang einfach easyCredit-Ratenkauf aus und zahlen Sie die erste Rate frühestens nach 30 Tagen. 
              Wenn Sie später schneller zurückzahlen oder eine Zahlpause einlegen wollen – auch das geht ganz einfach und flexibel.
            </p>
          </div>
        )}
        {this.selectedPaymentType === METHODS.BILL && (
          <div>
            <h1>Ganz entspannt mit Rechnung bezahlen.</h1>
            <p>
              Einfach - Sicher - Schnell. Mit easyCredit-Rechnung können sie Ihren Einkauf auf Rechnung bezahlen. Sie erhalten die Ware und erst frühestens nach 30 Tage wird der Betrag von Ihrem Konto eingezogen. Ganz ohne versteckte Kosten, Gebühren oder lästigen Papierkram. Wählen Sie im Bezahlvorgang einfach Rechnung aus. Und wenn Sie schneller zurückzahlen möchten ist das auch kein Problem - ganz einfach und flexibel.
            </p>
          </div>
        )}
      </div>
    ];
  }

  getUspFragment() {
    return [
      <div>
        {this.selectedPaymentType === METHODS.INSTALLMENT && (
          <div>
            <h2>easyCredit-Ratenkauf auf einen Blick</h2>
            <ul>
              <li><div><strong>Bestellwerte</strong>: 200 bis 10.000 Euro</div></li>
              <li><div><strong>Mindestrate</strong>: 20 Euro</div></li>
              <li><div><strong>Laufzeiten</strong>: 2 bis 60 Monate</div></li>
              <li><div><strong>PostIdent</strong>: Nicht nötig! Alle notwendigen Informationen werden direkt online bei der Bestellung erfasst.</div></li>
              <li><div><strong>Rückzahlung</strong>: Erst erhalten Sie Ihre Bestellung und können sich dann ganz in Ruhe entscheiden. Die erste Rate zahlen Sie frühestens 30 Tage nach Lieferung. Ihren detaillierten Ratenplan erhalten Sie per E-Mail.</div></li>
              <li><div>Vorzeitige Rückzahlungen und Zahlpausen sind gebührenfrei möglich.</div></li>
            </ul>
          </div>
        )}
        {this.selectedPaymentType === METHODS.BILL && (
          <div>
            <h2>easyCredit-Rechnung auf einen Blick</h2>
            <ul>
              <li><div><strong>Bestellwerte</strong>: 50 bis 5.000 Euro</div></li>
              <li><div>Für Waren und produktbezogene Dienstleistungen</div></li>
              <li><div><strong>Rückzahlung</strong>: Sie zahlen frühestens 30 Tage nach Lieferung. Erst erhalten Sie Ihre Bestellung und können sich dann ganz in Ruhe entscheiden.</div></li>
              <li><div>Ohne zusätzliche Kosten</div></li>
              <li><div>Eine vorzeitige Rückzahlung ist per Überweisung gebührenfrei möglich</div></li>
              <li><div>Für Kundinnen und Kunden ab 18 Jahren mit Wohnsitz in Deutschland</div></li>
            </ul>
          </div>
        )}
      </div>
    ];
  }

  render() { 
    return ([
      <div class={`ec-infopage ${this.variant}`}>
        <div class={`ec-infopage__intro ${this.variant}`}>
          <div class="col">
            <section class="ec-infopage__header">
              {this.hasBothPaymentTypes() && (
                <div class="ec-switch">
                  <button 
                    onClick={() => this.switchPaymentType(METHODS.INSTALLMENT)} 
                    class={{ active: this.selectedPaymentType === METHODS.INSTALLMENT }}
                    disabled={!this.availablePaymentTypes.includes(METHODS.INSTALLMENT)}
                  >
                    Ratenkauf
                  </button>
                  <button 
                    onClick={() => this.switchPaymentType(METHODS.BILL)} 
                    class={{ active: this.selectedPaymentType === METHODS.BILL }}
                    disabled={!this.availablePaymentTypes.includes(METHODS.BILL)}
                  >
                    Rechnung
                  </button>
                </div>
              )}

              <easycredit-logo 
                payment-type={this.selectedPaymentType}
                color={this.variant === 'enhanced' ? 'white' : undefined}
              ></easycredit-logo>
            </section>

            <section class="ec-infopage__text">
              {this.getIntroFragment()}

              <div class="actions">
                <a
                  class={this.variant === 'enhanced' ? 'btn btn-primary' : 'btn'}
                  href="#usp" onClick={(e) => {
                  e.preventDefault();
                  this.scrollToSection('usp');
                }}>Ihre Vorteile</a>
                <a href="#faq" onClick={(e) => {
                  e.preventDefault();
                  this.scrollToSection('faq');
                }}>Häufige Fragen (FAQ)</a>
              </div>
            </section>

            {this.variant === 'enhanced' && (
            <div class="ec-background">
              <div class="ec-circle"></div>
              <div class="ec-circle ec-circle-secondary"></div>
            </div>
            )}
          </div>

          <div
            class={`col image ${this.selectedPaymentType === METHODS.INSTALLMENT ? 'image-ratenkauf' : 'image-rechnung'}`}
          ></div>
        </div>

        <section class="ec-infopage__usp" id="usp">
          {this.getUspFragment()}
        </section>

        <section class="ec-infopage__text">
          <h2>Verlassen Sie sich auf einen starken Partner:</h2>
          <p>
            {this.selectedPaymentType === METHODS.INSTALLMENT && <span>easyCredit-Ratenkauf</span>}
            {this.selectedPaymentType === METHODS.BILL && <span>easyCredit-Rechnung</span>}
            &nbsp;ist ein Produkt der TeamBank AG, Beuthener Straße 25, 90471 Nürnberg, www.teambank.de. 
            Die TeamBank AG ist mit der Produktfamilie easyCredit das Kompetenzzentrum für modernes Liquiditätsmanagement in der Genossenschaftlichen FinanzGruppe Volksbanken Raiffeisenbanken. 
            Durch die Bereitstellung und Vernetzung innovativer Produkte und Services erhalten die Kunden einfach, überall und zu jeder Zeit Zugang zu Liquidität.
          </p>
          <div class="ec-infopage__logo-secondary"></div>
        </section>

        <section class="ec-infopage__faq" id="faq">
          <easycredit-faq payment-type={this.selectedPaymentType} />
        </section>

        <section class="ec-infopage__logos">
          <easycredit-logo payment-type={this.selectedPaymentType}></easycredit-logo>
          <div class="ec-infopage__logo-secondary"></div>
        </section>
      </div>
    ])
  }
}

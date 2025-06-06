import { Component, Prop, h } from '@stencil/core';
import { METHODS } from '../../types';

@Component({
  tag: 'easycredit-faq',
  styleUrl: 'easycredit-faq.scss',
  shadow: {
    delegatesFocus: true
  },
})

export class EasycreditFaq {
  @Prop({ mutable: true }) paymentType: string = METHODS.INSTALLMENT;

  getInstallmentFaq() {
    return [
      <easycredit-accordion>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Was ist der easyCredit-Ratenkauf?</div>
          <div>
            Mit dem easyCredit-Ratenkauf haben Sie die Möglichkeit, bequem und einfach per Raten zu zahlen. 
            Sie entscheiden, wie viel Sie zahlen wollen und genießen somit größte Flexibilität bei der Realisierung Ihrer Wünsche.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Wer kann den easyCredit-Ratenkauf abschließen?</div>
          <div>
            Wenn Sie über ein regelmäßiges monatliches Einkommen verfügen können, prüft die TeamBank gerne ihren individuellen Wunsch.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Welche Unterlagen sind für die Bestellung notwendig?</div>
          <div>
            Die Entscheidung, ob ein easyCredit-Ratenkauf möglich ist, erhalten Sie sofort im Rahmen des Bestellprozesses. Eine nachgelagerte Prüfung ist nicht mehr notwendig, sodass Sie auch keinerlei Unterlagen einreichen müssen.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Welche Finanzierungsbeträge sind beim easyCredit-Ratenkauf möglich?</div>
          <div>
            Sie können Einkäufe zwischen 200,- Euro bis 10.000,- Euro bequem und einfach durch den easyCredit-Ratenkauf abwickeln.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Welche Laufzeiten werden angeboten?</div>
          <div>
            Laufzeiten sind zwischen 2 und 60 Monaten möglich.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Welche Sicherheiten sind notwendig?</div>
          <div>
            Sicherheiten müssen nicht geleistet werden.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Wann werden die monatlichen Raten abgebucht?</div>
          <div>
            Die erste Rate wird frühestens 30 Tage nach Abschluss eingezogen. Der Einzugstermin ist automatisch auf den 1. eines Monats vorbelegt. Änderungen auf den 15. eines Monats sind während der Laufzeit in Ihrem easyCredit-Kundenportal möglich.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Sind Sondertilgungen während der Laufzeit möglich?</div>
          <div>
            Sondertilgungen sind jederzeit gebührenfrei möglich. Durch Sonderzahlungen reduziert sich automatisch die monatliche Rate. Bitte beachten Sie, dass die Mindestrate von 20,00 Euro nicht unterschritten werden kann.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Hat die Ablehnung meines Finanzierungswunsches Einfluss auf weitere Bestellungen?</div>
          <div>
            Nein, Ihr Produktwunsch wird immer individuell geprüft, sodass eine spätere Entscheidung durchaus positiv ausfallen kann.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Muss das PostIdent-Verfahren durchgeführt werden?</div>
          <div>
            Nein, das PostIdent-Verfahren ist nicht notwendig.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Kann ich meinen Ratenplan während der Laufzeit anpassen?</div>
          <div>
            Sollte es während der Laufzeit zu finanziellen Engpässen kommen, besteht die Möglichkeit einer Ratenaussetzung oder einer dauerhaften Reduzierung der Rate. Besuchen Sie einfach Ihr easyCredit-Kundenportal und nehmen Sie selbstständig die gewünschte Anpassung vor.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Was ist das easyCredit-Kundenportal?</div>
          <div>
            Bei Zahlung mit easyCredit-Ratenkauf erhalten Sie automatisch die Zugangsdaten zu Ihrem persönlichen easyCredit-Kundenportal. Hierin können Sie Ihre Ratenkäufe verwalten, Änderungen Ihrer persönlichen Daten vornehmen, Aufträge erteilen oder auch selbst ausführen. Weiter dient dieses Online-Portal als Ihr persönliches Postfach, in welches alle relevanten Dokumente zu Ihrem Ratenkauf eingestellt werden und jederzeit einsehbar sind.
          </div>
        </easycredit-accordion-item>
      </easycredit-accordion>
    ];
  }

  getBillFaq() {
    return [
      <easycredit-accordion>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Was ist easyCredit-Rechnung?</div>
          <div>
            Mit easyCredit-Rechnung haben Sie die Möglichkeit, bequem und einfach Ihren Einkauf jetzt zu tätigen und ihn erst in frühestens 30 Tagen zu bezahlen.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Wer kann mit easyCredit-Rechnung abschließen?</div>
          <div>
            Wenn Sie älter als 18 Jahre sind, über ein regelmäßiges monatliches Einkommen verfügen und ihr Wohnsitz in Deutschland haben, prüft die TeamBank gerne ihren individuellen Wunsch.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Welche Unterlagen sind für die Bestellung notwendig?</div>
          <div>
            Die Entscheidung, ob sie mit easyCredit-Rechnung zahlen können, erhalten Sie sofort im Rahmen des Bestellprozesses.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Welche Einkaufsbeträge sind bei easyCredit-Rechnung möglich?</div>
          <div>
            Sie können Einkäufe zwischen 50,- Euro bis 5.000,- Euro bequem und einfach mit easyCredit-Rechnung abwickeln.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Welche Sicherheiten sind notwendig?</div>
          <div>
            Sicherheiten müssen nicht geleistet werden.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Wann wird der Kaufbetrag abgebucht?</div>
          <div>
            Die Kaufbetrag wird frühestens 30 Tage nach Erhalt der Ware eingezogen. Der Einzugstermin ist automatisch auf den 1. eines Monats vorbelegt.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Ist eine vorzeitige Zahlung des Kaufbetrags möglich?</div>
          <div>
            Eine vorzeitige Zahlung des fälligen Kaufbetrags ist ab dem Folgetag des Kaufs jederzeit gebührenfrei möglich. Überweisen Sie dazu einfach den Kaufbetrag auf das im Kaufvertrag/Kundenportal genannte Konto.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Hat die Ablehnung meines Zahlungswunschs Einfluss auf weitere Bestellungen?</div>
          <div>
            Nein, Ihr Produktwunsch wird immer individuell geprüft, sodass eine spätere Entscheidung durchaus positiv ausfallen kann.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Muss das PostIdent-Verfahren durchgeführt werden?</div>
          <div>
            Nein, das PostIdent-Verfahren ist nicht notwendig.
          </div>
        </easycredit-accordion-item>
        <easycredit-accordion-item>
          <div class="h3" slot="title">Was ist das easyCredit-Kundenportal?</div>
          <div>
            Bei Zahlung mit easyCredit-Rechnung erhalten Sie automatisch die Zugangsdaten zu Ihrem persönlichen easyCredit-Kundenportal. Hierin können Sie Ihre Rechnungskäufe verwalten, Änderungen Ihrer persönlichen Daten vornehmen, Aufträge erteilen oder auch selbst ausführen. Weiter dient dieses Online-Portal als Ihr persönliches Postfach, in welches alle relevanten Dokumente zu Ihrem Rechnungskauf und allen anderen easyCredit-Produkten eingestellt werden und jederzeit einsehbar sind.
          </div>
        </easycredit-accordion-item>
      </easycredit-accordion>
    ];
  }

  render() { 
    return [
      <div class="ec-faq">
        <h2>
          {this.paymentType === METHODS.INSTALLMENT 
            ? 'FAQ - easyCredit-Ratenkauf'
            : 'FAQ - easyCredit-Rechnung'
          }
        </h2>

        {this.paymentType === METHODS.INSTALLMENT 
          ? this.getInstallmentFaq()
          : this.getBillFaq()
        }
      </div>
    ];
  }
}

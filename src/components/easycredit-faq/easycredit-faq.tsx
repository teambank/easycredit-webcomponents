import { Component, h } from '@stencil/core';

@Component({
  tag: 'easycredit-faq',
  styleUrl: 'easycredit-faq.scss',
  shadow: true,
})

export class EasycreditFaq {

  render() { 
    return ([
      <div class="ec-faq">
        <h2>FAQ - ratenkauf by easyCredit</h2>

        <easycredit-accordion>
            <easycredit-accordion-item>
                <h3 slot="title">Was ist der ratenkauf by easyCredit?</h3>
                <div>
                    Mit dem ratenkauf by easyCredit haben Sie die Möglichkeit, bequem und einfach per Raten zu zahlen. 
                    Sie entscheiden, wie viel Sie zahlen wollen und genießen somit größte Flexibilität bei der Realisierung Ihrer Wünsche.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Wer kann den ratenkauf by easyCredit abschließen?</h3>
                <div>
                    Wenn Sie über ein regelmäßiges monatliches Einkommen verfügen können, prüft die TeamBank gerne ihren individuellen Wunsch.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Welche Unterlagen sind für die Bestellung notwendig?</h3>
                <div>
                    Die Entscheidung, ob ein ratenkauf by easyCredit möglich ist, erhalten Sie sofort im Rahmen des Bestellprozesses. Eine nachgelagerte Prüfung ist nicht mehr notwendig, sodass Sie auch keinerlei Unterlagen einreichen müssen.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Welche Finanzierungsbeträge sind beim ratenkauf by easyCredit möglich?</h3>
                <div>
                    Sie können Einkäufe zwischen 200,- Euro bis 10.000,- Euro bequem und einfach durch den ratenkauf by easyCredit abwickeln.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Welche Laufzeiten werden angeboten?</h3>
                <div>
                    Laufzeiten sind zwischen 2 und 60 Monaten möglich.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Welche Sicherheiten sind notwendig?</h3>
                <div>
                    Sicherheiten müssen nicht geleistet werden.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Wann werden die monatlichen Raten abgebucht?</h3>
                <div>
                    Die erste Rate wird frühestens 30 Tage nach Abschluss eingezogen. Der Einzugstermin ist automatisch auf den 1. eines Monats vorbelegt. Änderungen auf den 15. eines Monats sind während der Laufzeit in Ihrem easyCredit-Kundenportal möglich.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Sind Sondertilgungen während der Laufzeit möglich?</h3>
                <div>
                    Sondertilgungen sind jederzeit gebührenfrei möglich. Durch Sonderzahlungen reduziert sich automatisch die monatliche Rate. Bitte beachten Sie, dass die Mindestrate von 20,00 Euro nicht unterschritten werden kann.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Hat die Ablehnung meines Finanzierungswunsches Einfluss auf weitere Bestellungen?</h3>
                <div>
                    Nein, Ihr Produktwunsch wird immer individuell geprüft, sodass eine spätere Entscheidung durchaus positiv ausfallen kann.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Muss das PostIdent-Verfahren durchgeführt werden?</h3>
                <div>
                    Nein, das PostIdent-Verfahren ist nicht notwendig.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Kann ich meinen Ratenplan während der Laufzeit anpassen?</h3>
                <div>
                    Sollte es während der Laufzeit zu finanziellen Engpässen kommen, besteht die Möglichkeit einer Ratenaussetzung oder einer dauerhaften Reduzierung der Rate. Besuchen Sie einfach Ihr easyCredit-Kundenportal und nehmen Sie selbstständig die gewünschte Anpassung vor.
                </div>
            </easycredit-accordion-item>
            <easycredit-accordion-item>
                <h3 slot="title">Was ist das easyCredit-Kundenportal?</h3>
                <div>
                    Bei Zahlung mit ratenkauf by easyCredit erhalten Sie automatisch die Zugangsdaten zu Ihrem persönlichen easyCredit-Kundenportal. Hierin können Sie Ihre Ratenkäufe verwalten, Änderungen Ihrer persönlichen Daten vornehmen, Aufträge erteilen oder auch selbst ausführen. Weiter dient dieses Online-Portal als Ihr persönliches Postfach, in welches alle relevanten Dokumente zu Ihrem Ratenkauf eingestellt werden und jederzeit einsehbar sind.
                </div>
            </easycredit-accordion-item>
        </easycredit-accordion>
      </div>
    ])
  }
}

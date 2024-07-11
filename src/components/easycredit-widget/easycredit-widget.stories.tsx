import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Marketing/Widget",
  parameters: {
    docs: {
      description: {
        component:
          "Die Widget-Komponente wird typischerweise auf der Produktdetailseite gezeigt, kann aber auch im Warenkorb oder in der Produktübersicht integriert werden. Sie berechnet die günstigstmögliche Rate mit der ein Produkt mit einem bestimmten Preis finanziert werden kann. Bei Klick auf \"mehr Infos\" öffnet sich der Ratenrechner mit weiteren Details zur Finanzierung. Liegt der Produktpreis außerhalb der möglichen Finanzierungsbeträge weist das Widget auf Wunsch auf den minimal oder maximal möglichen Finanzierungsbetrag hin.",
      }
    }    
  },
  argTypes: {
    webshopId: {
      description: 'die Kennung des Webshops'
    },
    amount: {
      description: 'der zu finanzierende Betrag für den die Rate angezeigt werden soll, üblicherweise der Produktpreis'
    },
    paymentTypes: {
      description: 'die zu berücksichtigenden Zahlungsmethoden, als komma-getrennte Liste',
      table: {
        defaultValue: { summary: 'INSTALLMENT,BILL' },
      },
       control: 'check', options: [METHODS.INSTALLMENT, METHODS.BILL]
    },
    extended: {
      description: 'bestimmt, ob das Widget außerhalb der Betragsgrenzen angezeigt wird (optional)',
      defaultValue: 'false',
      table: {
        category: 'optional',
        defaultValue: { summary: 'true' }
      }
    },
    displayType: {
      description: 'mit dieser Option kann eine alternative Darstellungsvariante gewählt werden',
      control: 'radio',
      options: ['normal', 'clean', 'minimal'],
      table: {
        category: 'optional',
        defaultValue: { summary: 'normal' },
      }
    },
    disableFlexprice: {
      description: 'wenn diese Option gesetzt ist, wird die Zins-Flexibilisierung bei der Berechnung nicht berücksichtigt',
      table: {
        category: 'optional',
        defaultValue: { summary: 'false' },
      }
    }
  }
};

let args = {
  webshopId: '2.de.9999.9999',
  amount: 500,
  extended: true,
  displayType: '',
  disableFlexprice: false
}
const Template = (args) => `<easycredit-widget ${buildAttributes(args).join(' ')} />`;

const TemplateFirst = (args) => {
  return `
  <label>Finanzierungsbetrag:</label>
  <input type="number" onKeyup="this.parentElement.querySelector('easycredit-widget').setAttribute('amount', this.value);" />
  <br /><br />

  ` + Template(args)
}

export const WidgetNormal = TemplateFirst.bind({});
WidgetNormal.storyName = 'Standard'
WidgetNormal.args = args

export const WidgetBillPayment = Template.bind({});
WidgetBillPayment.storyName = 'nur Rechnungskauf';
WidgetBillPayment.args = {
  ...args,
  paymentTypes: METHODS.BILL,
};

export const WidgetInstallmentPayment = Template.bind({});
WidgetInstallmentPayment.storyName = 'nur Ratenkauf';
WidgetInstallmentPayment.args = {
  ...args,
  paymentTypes: METHODS.INSTALLMENT,
};

export const WidgetBelowInstallments = Template.bind({});
WidgetBelowInstallments.storyName = 'Grenzdarstellung (50 - 199 EUR)';
WidgetBelowInstallments.args = {
  ...args,
  ...{
    amount: 198,
  },
};

export const WidgetAboveBill = Template.bind({});
WidgetAboveBill.storyName = 'Grenzdarstellung (5001 - 9999 EUR)';
WidgetAboveBill.args = {
  ...args,
  ...{
    amount: 6000,
  },
};

export const WidgetBelow = Template.bind({});
WidgetBelow.storyName = 'Grenzdarstellung (< 50 EUR)';
WidgetBelow.args = {
  ...args,
  ...{
    amount: 49,
  },
};

export const WidgetAbove = Template.bind({});
WidgetAbove.storyName = 'Grenzdarstellung (> 10.000 EUR)';
WidgetAbove.args = { ... args, ... {
  amount: 12000
}}

export const WidgetExtended = Template.bind({});
WidgetExtended.storyName = 'außerhalb Betragsgrenze, nicht anzeigen'
WidgetExtended.args = { ... args, ... {
  amount: 12000,
  extended: false
}}

export const WidgetDisplayTypeClean = Template.bind({});
WidgetDisplayTypeClean.storyName = 'displayType: clean'
WidgetDisplayTypeClean.args = { ... args, ... {
  amount: 500,
  displayType: 'clean'
}}

export const WidgetDisplayTypeMinimal = Template.bind({});
WidgetDisplayTypeMinimal.storyName = 'displayType: minimal'
WidgetDisplayTypeMinimal.args = { ... args, ... {
  amount: 500,
  displayType: 'minimal'
}}

export const WidgetWithoutFlexprice = Template.bind({});
WidgetWithoutFlexprice.storyName = 'ohne Zins-Flex'
WidgetWithoutFlexprice.args = { ... args, ... {
  amount: 500,
  disableFlexprice: true
}}

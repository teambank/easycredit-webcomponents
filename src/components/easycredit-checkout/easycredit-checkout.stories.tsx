import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Checkout/Checkout",
  parameters: {
    docs: {
      description: {
        component:
          `Die Checkout-Komponente ermöglicht eine Interaktion mit easyCredit bereits im Online-Shop, noch vor Weiterleitung auf die PaymentPage. Die Komponente wird typischerweise in Verbindung mit dem Checkout-Label verwendet und erst dann angezeigt, wenn der Kunde die Zahlart in der Zahlartenauswahl gewählt hat. Die Komponente enthält ein Modal, welches die Zustimmung des Kunden zur Datenweitergabe ermöglicht, bevor er auf die PaymentPage weitergeleitet wird. Die Zustimmungserklärung ist für den jeweiligen Händler personalisiert und wird dynamisch bezogen. 
          
Sobald der Kunde die PaymentPage durchlaufen hat, zeigt das Widget die vom Kunden die Auswahl des Kunden an (${'`paymentPlan`'}). Beim Ratenkauf werden die gewählten Raten gezeigt, beim Rechnungskauf die Zeitleiste bis zur tatsächlichen Zahlung. Ist ein Fehler aufgetreten, z.B. wenn der Betrag außerhalb der erlaubten Finanzierungsbeträge liegt, so wird stattdessen der entsprechende Fehler angezeigt (${'`alert`'})`,
      }
    }    
  },
  argTypes: {
    webshopId: {
      description: "die Kennung des Webshops",
    },
    paymentType: {
      options: [METHODS.INSTALLMENT, METHODS.BILL],
      control: { type: 'radio' },
    },
    amount: {
      description: "der zu finanzierende Betrag für den die Ratenauswahl angezeigt werden soll",
    },
    isActive: {
      description: "blendet das komplette Element ein oder aus",
      table: {
        defaultValue: { summary: 'true' }
      }
    },
    alert: {
      description: "ist dieses Attribut gesetzt, wird der Inhalt dieses Attributs als Meldung angezeigt",
    },
    paymentPlan: {
      description: "erwartet das JSON-formatierte TransactionSummary-Objekt (siehe GET /api/payment/v3/transaction/{technicalTransactionId}))'",
    },
    submit: {
      name: 'easycredit-submit',
      action: 'easycredit-submit',
      table: {
        category: "Events",
      },
      description: "Wird ausgelöst bei Klick auf 'Akzeptieren' / 'Weiter zum Rechnungskauf'",
    }
  },
};

let args = {
    webshopId: '2.de.9999.9999',
    amount: 820.31,
    isActive: true,
    alert: '',
    paymentPlan: '',
    paymentType: METHODS.INSTALLMENT
}

const Template = (args) => {
  delete args.submit;
  return `
    <easycredit-checkout ${buildAttributes(args).join(' ')} />
  `
}

const TemplateExample = (args) => {
  return Template(args) + `
  <script>
  document.addEventListener('easycredit-submit', (e) => {
    if (!e.target.matches('easycredit-checkout')) {
      return;
    }

    // window.location.href = 'https://shopurl/easycredit/start';
    // or
    // document.querySelector('form.my-form').submit();

    alert([
      'submitted successfully!',
      JSON.stringify(e.detail, null, 2)
    ].join("\\n\\n"));

  });
  </script>
  `
}

export const CheckoutInitial = TemplateExample.bind({})
CheckoutInitial.storyName = 'Ratenkauf (initial)'
CheckoutInitial.args = args

export const CheckoutCalculated = Template.bind({})
CheckoutCalculated.storyName = 'Ratenkauf (berechnet)'
CheckoutCalculated.args = { ...args, ... {
    paymentPlan: '{"orderValue":7702.06,"interest":1803.42,"totalValue":9505.48,"decisionOutcome":"POSITIVE","numberOfInstallments":60,"installment":159,"lastInstallment":124.48,"mtan":{"required":false,"successful":false},"bankAccountCheck":{"required":false}}'
}}

export const CheckoutInitialBillPayment = TemplateExample.bind({})
CheckoutInitialBillPayment.storyName = 'Rechnungskauf (initial)'
CheckoutInitialBillPayment.args = {
  ...args, ... {
    paymentType: METHODS.BILL
  }
}

export const CheckoutCalculatedBillPayment = Template.bind({})
CheckoutCalculatedBillPayment.storyName = 'Rechnungskauf (berechnet)'
CheckoutCalculatedBillPayment.args = {
  ...args, ... {
    paymentType: METHODS.BILL,
    paymentPlan: '{"orderValue":7702.06,"interest":1803.42,"totalValue":9505.48,"decisionOutcome":"POSITIVE","numberOfInstallments":60,"installment":159,"lastInstallment":124.48,"mtan":{"required":false,"successful":false},"bankAccountCheck":{"required":false}}'
  }
}

export const CheckoutError = Template.bind({})
CheckoutError.storyName = 'Fehler'
CheckoutError.args = args
CheckoutError.args = { ... args, ... {
    alert: 'Es ist ein Fehler aufgetreten.'
}}

/*
export const CheckoutWithoutFlexprice = Template.bind({})
CheckoutWithoutFlexprice.storyName = 'ohne Zins-Flex'
CheckoutWithoutFlexprice.args = args
CheckoutWithoutFlexprice.args = { ... args, ... {
    disableFlexprice: true
}}
*/

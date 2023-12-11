import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Checkout/Checkout",
  parameters: {
    docs: {
      description: {
        component:
          `Die Checkout-Komponente ermöglicht eine Interaktion mit dem Ratenkauf bereits im Online-Shop, noch vor Weiterleitung auf die PaymentPage. Die Komponente wird typischerweise in Verbindung mit dem Checkout-Label verwendet und erst dann angezeigt, wenn der Kunde die Zahlart in der Zahlartenauswahl gewählt hat. Die Komponente enthält ein Modal, welches die Zustimmung des Kunden zur Datenweitergabe ermöglicht, bevor er auf die PaymentPage weitergeleitet wird. Die Zustimmungserklärung ist für den jeweiligen Händler personalisiert. 
          
Sobald der Kunde die PaymentPage durchlaufen hat, zeigt das Widget die vom Kunden gewählten Raten statt der Ratenauswahl an. Ist ein Fehler aufgetreten, z.B. wenn der Betrag außerhalb der erlaubten Finanzierungsbeträge liegt, so wird stattdessen der entsprechende Fehler angezeigt.`,
      }
    }    
  },
  argTypes: {
    webshopId: {
      description: "die Kennung des Webshops",
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
    method: {
      options: ['INSTALLMENT_PAYMENT', 'BILL_PAYMENT'],
      control: { type: 'radio' },
    },
    submit: {
      action: 'submit',
      table: {
        category: "Events",
      },
      description: "Wird ausgelöst bei Klick auf 'Akzeptieren'",
    }
  },
};

let args = {
    webshopId: '2.de.9999.9999',
    amount: 820.31,
    isActive: true,
    alert: '',
    paymentPlan: '',
    method: 'BILL_PAYMENT'
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
  document.querySelector('easycredit-checkout').addEventListener('submit',function() {
    // window.location.href = 'https://shopurl/easycredit/start';
    // or
    // document.querySelector('form.my-form').submit();
  });
  </script>
  `
}

export const CheckoutInitial = TemplateExample.bind({})
CheckoutInitial.storyName = 'initial'
CheckoutInitial.args = args

export const CheckoutCalculated = Template.bind({})
CheckoutCalculated.storyName = 'berechnet'
CheckoutCalculated.args = { ...args, ... {
    paymentPlan: '{"orderValue":7702.06,"interest":1803.42,"totalValue":9505.48,"decisionOutcome":"POSITIVE","numberOfInstallments":60,"installment":159,"lastInstallment":124.48,"mtan":{"required":false,"successful":false},"bankAccountCheck":{"required":false}}'
}}

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

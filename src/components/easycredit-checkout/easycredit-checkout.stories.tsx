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
  argTypes: {},
};

let args = {
    webshopId: '2.de.9999.9999',
    amount: 820.31,
    isActive: true,
    alert: '',
    paymentPlan: ''
}

const Template = (args) => `<easycredit-checkout ${buildAttributes(args).join(' ')} />`

export const CheckoutInitial = Template.bind({})
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

import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Merchant/Manager",
  parameters: {
    docs: {
      description: {
        component: `Der Merchant Manager ermöglicht dem Händler eine einfache Transaktionsverarbeitung über sein Shop-Backend. Typischerweise wird er im Shop-System in der Bestelldetailansicht angezeigt oder im Bereich der Transaktionen einer Bestellung.
        
Um die Transaktionen abrufen zu können, müssen für den Merchant Manager die Endpunkte und die Authentifizerung angegeben werden. Dies kann z.B. global in der Seite über ein Skript-Tag passieren, siehe [Konfiguration über globale Variable](?path=/docs/getting-started-configuration--docs).
        `,
      }
    }    
  },
  argTypes: {
    txId: {
      description: 'die Transaktions-ID der easyCredit-Zahlung'
    },
    date: {
      description: 'Bestelldatum, verwendet zur Unterscheidung zwischen "nicht verfügbar" und "noch nicht verfügbar". Der Wert muss von Date.parse() geparst werden können.'
    }
  },
};

let args = {
    txId: 'V3MJ44',
    date: ''
}

const Template = (args) => `<easycredit-merchant-manager ${buildAttributes(args).join(' ')} />`

export const ManagerNormal = Template.bind({})
ManagerNormal.storyName = 'Standard'
ManagerNormal.args = { ... args }

export const ManagerNotAvailable = Template.bind({})
ManagerNotAvailable.storyName = 'nicht verfügbar'
ManagerNotAvailable.args = { ... args, ... {
    txId: 'xyz'
}}

export const ManagerNotYetAvailable =  Template.bind({})
ManagerNotYetAvailable.storyName = 'nicht verfügbar (< 1 Tag)'
ManagerNotYetAvailable.args = { ... args, ... {
  txId: 'xyz',
  date: new Date().toISOString()
}}

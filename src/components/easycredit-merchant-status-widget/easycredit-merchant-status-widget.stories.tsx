import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Merchant/StatusWidget",
  parameters: {
    docs: {
      description: {
        component:
          `Das StatusWidget ermöglicht die Anzeige des Transaktionsstatus im Backend eines Online-Shops. Der Händler erhält über das StatusWidget einen schnellen Einblick in den Transaktionsstatus einer Bestellung. Das StatusWidget kann auf der Seite integriert werden, auf der die Bestelldetails angezeigt werden, aber auch in der Listenansicht um auf einen Blick den Status aller angezeigten Bestellungen einzusehen.
          
Das Merchant StatusWidget benötigt eine initale Konfiguration zum Abruf der Transaktionsdaten, siehe MerchantManager`,
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
  }
};

let args = {
    txId: 'V3MDGE',
    date: ''
}
const Template = (args) => `<easycredit-merchant-status-widget ${buildAttributes(args).join(' ')} />`;

export const StatusWidgetNormal = Template.bind({});
StatusWidgetNormal.storyName = 'Standard'
StatusWidgetNormal.args = { ... args }

export const StatusWidgetNotAvailable = Template.bind({});
StatusWidgetNotAvailable.storyName = 'nicht verfügbar'
StatusWidgetNotAvailable.args = { ... args, ... {
    txId: 'xyz'
}}

export const StatusWidgetNotYetAvailable = Template.bind({});
StatusWidgetNotYetAvailable.storyName = 'nicht verfügbar (< 1 Tag)'
StatusWidgetNotYetAvailable.args = { ... args, ... {
    date: new Date().toISOString()
}}

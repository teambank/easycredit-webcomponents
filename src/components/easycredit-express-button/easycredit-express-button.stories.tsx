import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Checkout/ExpressButton",
  parameters: {
    docs: {
      description: {
        component:
          "Der Express Button für den easyCredit-Ratenkauf kann auf Produktseiten integriert werden, um direkt von dieser Seite aus den Bezahlvorgang zu starten.",
      }
    }    
  },
  argTypes: {
    // bgBlue: {
    //   defaultValue: { summary: "false" },
    //   description: "Wechselt die Hintergrundfarbe des Buttons von \"eC Orange\" auf \”eC Primärblau\"."
    // },
    fullWidth: {
      defaultValue: { summary: "false" },
      description: "Zeigt den Button über 100% der zur Verfügung stehenden Breite an."
    }
  },
}

let args = {
  webshopId: '2.de.9999.9999',
  // amount: 299,
  // bgBlue: false,
  fullWidth: false,
  // redirectUrl: 'https://easycredit-ratenkauf.de/'
}

const Template = (args) => `<easycredit-express-button ${buildAttributes(args).join(' ')} />`;

export const ExpressButton = Template.bind({});
ExpressButton.storyName = 'ExpressButton'
ExpressButton.args = args

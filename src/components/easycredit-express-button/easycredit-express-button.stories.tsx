import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Checkout/ExpressButton",
  parameters: {
    docs: {
      description: {
        component:
          "Der Express Button für den easyCredit-Ratenkauf kann auf Produktseiten integriert werden, um direkt von dieser Seite aus den Bezahlvorgang zu starten. Im Button wird dem User bereits eine Ratenoption angezeigt (\"ab\").",
      }
    }    
  },
  argTypes: {
    link: {
      description: "Überschreibt das Linkziel für den Link \"Mehr erfahren\". Im Standard ist https://www.easycredit.de/ratenkauf-by-easycredit als Linkziel gesetzt."
    },
    bgBlue: {
      defaultValue: { summary: "false" },
      description: "Wechselt die Hintergrundfarbe des Buttons von \"eC Orange\" auf \”eC Primärblau\"."
    },
    fullWidth: {
      defaultValue: { summary: "false" },
      description: "Zeigt den Button über 100% der zur Verfügung stehenden Breite an."
    }
  },
}

let args = {
  link: '',
  bgBlue: false,
  fullWidth: false
}

const Template = (args) => `<easycredit-express-button ${buildAttributes(args).join(' ')} />`;

export const ExpressButton = Template.bind({});
ExpressButton.storyName = 'ExpressButton'
ExpressButton.args = args

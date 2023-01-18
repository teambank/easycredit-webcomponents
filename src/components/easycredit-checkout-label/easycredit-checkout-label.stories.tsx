import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Checkout/Label",
  parameters: {
    docs: {
      description: {
        component:
          "Das Checkout-Label kann in der Zahlartenauswahl des Shops integriert werden. Typischerweise wird es neben einem Radio-Button gezeigt, der die Auswahl der Zahlungsart ermöglicht. In Verbindung mit der Checkout-Komponente kann es zur CD-konformen Implementierung des Ratenkaufs im Checkout eingesetzt werden.",
      }
    }    
  },
  argTypes: {
    label: {
      description: 'Titel'
    },
    slogan: {
      description: 'Untertitel'
    }

  },
};


let args = {
  label: '',
  slogan: ''
}

const Template = (args) => `<easycredit-checkout-label ${buildAttributes(args).join(' ')} />`
export const Label = Template.bind({});
Label.args = args
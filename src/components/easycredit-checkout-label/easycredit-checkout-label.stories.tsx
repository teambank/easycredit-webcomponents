import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

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
    paymentType: {
      table: {
        defaultValue: { summary: "INSTALLMENT" },
        category: "optional",
      },
      description: 'Zahlungsart',
      options: [METHODS.INSTALLMENT, METHODS.BILL],
      control: { type: 'radio' },
    },
    label: {
      table: {
        category: "optional",
      },
      description: 'Titel'
    },
    slogan: {
      table: {
        category: "optional",
      },
      description: 'Untertitel'
    }
  },
};


let args = {
  paymentType: METHODS.INSTALLMENT,
  label: '',
  slogan: ''
}

const Template = (args) => `<easycredit-checkout-label ${buildAttributes(args).join(' ')} />`
export const Label = Template.bind({});
Label.args = args
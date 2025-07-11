import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Checkout/Label",
  parameters: {
    docs: {
      description: {
        component:
          "The checkout label can be integrated into the payment method selection of the shop. Typically, it is shown next to a radio button that allows the selection of the payment method. In conjunction with the checkout component, it can be used for a CI-compliant implementation of installment purchase in the checkout.",
      }
    }    
  },
  argTypes: {
    paymentType: {
      table: {
        defaultValue: { summary: "INSTALLMENT" },
        category: "optional",
      },
      description: 'Payment type',
      options: [METHODS.INSTALLMENT, METHODS.BILL],
      control: { type: 'radio' },
    },
    label: {
      table: {
        category: "optional",
      },
      description: 'Title'
    },
    slogan: {
      table: {
        category: "optional",
      },
      description: 'Subtitle'
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
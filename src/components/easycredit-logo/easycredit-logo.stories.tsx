import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Marketing/Logo",
  parameters: {
    docs: {
      description: {
        component:
          "The logo simplifies the integration of easyCredit logos and can be used instead of an img tag.",
      }
    }    
  },
  argTypes: {
    webshopId: {
      description: "the identifier of the webshop",
    },
    paymentType: {
      options: [METHODS.INSTALLMENT, METHODS.BILL],
      control: { type: 'radio' },
    },
    color: {
      options: ['white', 'blue'],
      control: { type: 'radio' },
    },
    alt: {
      description: "Alternative text for the logo",
    },  
  },
};


let args = {
  alt: ''
}

const Template = (args) => `<easycredit-logo ${buildAttributes(args).join(' ')} />`
export const Logo = Template.bind({});
Logo.storyName = 'Logo'
Logo.args = args

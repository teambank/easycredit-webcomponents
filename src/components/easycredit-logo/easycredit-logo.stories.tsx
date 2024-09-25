import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Marketing/Logo",
  parameters: {
    docs: {
      description: {
        component:
          "Das Logo vereinfacht die Einbindung der easyCredit-Logos und kann statt eines img-Tags eingesetzt werden",
      }
    }    
  },
  argTypes: {
    webshopId: {
      description: "die Kennung des Webshops",
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
      description: "Alternativtext des Logos",
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

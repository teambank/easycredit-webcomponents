import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Marketing/Faq",
  parameters: {
    docs: {
      description: {
        component:
          "The FAQ component is intended for integration into the content area. The included entries are predefined and cannot be changed.",
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
  },
};

const Template = (args) => `<easycredit-faq ${buildAttributes(args).join(' ')} />`;
export const Faq = Template.bind({});

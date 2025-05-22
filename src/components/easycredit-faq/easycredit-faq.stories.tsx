import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Marketing/Faq",
  parameters: {
    docs: {
      description: {
        component:
          "Die FAQ-Komponente ist zur Integration in den Inhaltsbereich gedacht. Die enthaltenen Einträge sind vorgegeben und können nicht verändert werden.",
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
  },
};

const Template = (args) => `<easycredit-faq ${buildAttributes(args).join(' ')} />`;
export const Faq = Template.bind({});

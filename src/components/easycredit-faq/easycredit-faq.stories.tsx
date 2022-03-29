import { buildAttributes } from '../../../.storybook/helpers'

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
  argTypes: {},
};

const Template = (args) => `<easycredit-faq ${buildAttributes(args).join(' ')} />`;
export const Faq = Template.bind({});

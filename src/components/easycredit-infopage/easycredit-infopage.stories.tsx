import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/Infopage",
  parameters: {
    docs: {
      description: {
        component:
          "Die Infopage-Komponente ermöglicht die einfache Integration einer Zahlungsartenseite für den Ratenkauf im Frontend des Shops. Sie erklärt den Ratenkauf im Detail und enthält alle Informationen, die für Ihre Kunden interessant sind.",
      }
    }    
  },
  argTypes: {},
};

const Template = (args) => `<easycredit-infopage ${buildAttributes(args).join(' ')} />`;
export const Infopage = Template.bind({});
Infopage.storyName = 'Infopage'

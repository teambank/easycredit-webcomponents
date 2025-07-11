import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/BoxTop",
  parameters: {
    docs: {
      description: {
        component:
          "The slider component can be displayed at the top of the screen or at the top edge of a container and promotes installment purchase with short slogans. The slogans are predefined and cannot be customized.",
      }
    }    
  },
  argTypes: {},
};

const Template = (args) =>
    `<easycredit-box-top ${buildAttributes(args).join(' ')} />`;
export const BoxTop = Template.bind({});
BoxTop.storyName = 'BoxTop'
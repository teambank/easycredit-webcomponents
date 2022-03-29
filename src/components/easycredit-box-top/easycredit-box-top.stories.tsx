import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/BoxTop",
  parameters: {
    docs: {
      description: {
        component:
          "Die Slider-Komponente kann am oberen Bildschirmrand oder am oberen Rand eines Containers angezeigt werden und bewirbt den Ratenkauf mit kurzen Slogans. Die Slogans sind vorgegeben und können nicht angepasst werden.",
      }
    }    
  },
  argTypes: {},
};

const Template = (args) =>
    `<easycredit-box-top ${buildAttributes(args).join(' ')} />`;
export const BoxTop = Template.bind({});
BoxTop.storyName = 'BoxTop'
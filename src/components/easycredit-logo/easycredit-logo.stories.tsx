import { buildAttributes } from '../../../.storybook/helpers'

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
  argTypes: {},
};


let args = {
  alt: ''
}

const Template = (args) => `<easycredit-logo ${buildAttributes(args).join(' ')} />`
export const Logo = Template.bind({});
Logo.storyName = 'Logo'
Logo.args = args

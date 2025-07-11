import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/BoxFlash",
  parameters: {
    docs: {
      description: {
        component:
          "This marketing component allows a banner to be displayed at the bottom of the screen to promote installment purchase. The banner shows a default image, which can be overridden via the src attribute. This allows merchants to use an image that matches their product offering.",
      },
    }    
  },
  argTypes: {
    src: {
      description: 'replaces the default image with a custom graphic (Retina format: at least 240 x 360)'
    }
  }
}

let args = {
    src: '',
    isOpen: false
}

const Template = (args) => `
  <button onClick="this.parentElement.querySelector('easycredit-box-flash').setAttribute('is-open',true);">Open Flashbox</button>
  
  <easycredit-box-flash ${buildAttributes(args).join(' ')} />
`;
export const BoxFlash = Template.bind({});
BoxFlash.storyName = 'BoxFlash'
BoxFlash.args = args

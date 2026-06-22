import { buildAttributes } from '../../../.storybook/helpers'

const STORYBOOK_MIN_HEIGHT = 520;

export default {
  title: "Marketing/BoxFlash",
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "This marketing component allows a banner to be displayed at the bottom of the screen to promote installment purchase. The banner shows a default image, which can be overridden via the src attribute. This allows merchants to use an image that matches their product offering.",
      },
      story: {
        height: `${STORYBOOK_MIN_HEIGHT}px`,
      },
    }    
  },
  argTypes: {
    src: {
      description: 'replaces the default image with a custom graphic (Retina format: at least 240 x 360)'
    },
    href: {
      description: 'target URL for the "Mehr erfahren" link (defaults to https://www.easycredit.de/ratenkauf)'
    }
  }
}

let args = {
    src: '',
    isOpen: true
}

const Template = (args) => `
  <style>
    html, body, #storybook-root {
      min-height: ${STORYBOOK_MIN_HEIGHT}px;
    }
  </style>
  <button onClick="this.parentElement.querySelector('easycredit-box-flash').setAttribute('is-open',true);">Open Flashbox</button>
  
  <easycredit-box-flash ${buildAttributes(args).join(' ')} />
`;
export const BoxFlash = Template.bind({});
BoxFlash.storyName = 'BoxFlash'
BoxFlash.args = args

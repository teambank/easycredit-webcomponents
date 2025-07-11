import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/BoxListing",
  parameters: {
    docs: {
      description: {
        component:
          "The listing component can be used within the product list to replace a product with a banner promoting installment purchase. The banner shows a default image, which can be overridden via the src attribute. This allows merchants to use an image that matches their product offering.",
      }
    }    
  },
  argTypes: {
    src: {
      description: 'replaces the default image with a custom graphic (Retina format: at least 600 x 574)'
    }
  }
}

let args = {
    src: ''
}

const Template = (args) => `<easycredit-box-listing ${buildAttributes(args).join(' ')} />`;
export const BoxListing = Template.bind({});
BoxListing.storyName = 'BoxListing'
BoxListing.args = args

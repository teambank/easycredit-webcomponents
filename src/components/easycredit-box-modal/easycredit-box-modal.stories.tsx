import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/BoxModal",
  parameters: {
    docs: {
      description: {
        component:
          "The modal component can be used to actively draw a customer's attention to installment purchase at a specific point in the shop. Timed display of the modal is possible. If the customer closes the modal, the component remembers this and prevents it from being shown again.",
      }
    }    
  },
  argTypes: {
    src: {
      description: 'replaces the default image with a custom graphic (Retina format: at least 700 x 460)'
    },
    isOpen: {
      description: 'this option can be used to open and close the modal'
    },
    delay: {
      description: 'if a value is specified here, the modal will automatically open after this time (in milliseconds). If the value is not specified, the modal does not open automatically.'
    },
    snoozeFor: {
      description: 'after this time, the modal will be displayed again when the page is loaded if the user has already closed it (in seconds), only in conjunction with openDelay'
    }
  },
};

let args = {
    src: '',
    delay: '',
    snoozeFor: '',
    isOpen: false
}

const Template = (args) => {

  return `
    <button onClick="this.parentElement.querySelector('easycredit-box-modal').setAttribute('is-open',true);">Open Modal</button>

    <easycredit-box-modal ${buildAttributes(args).join(' ')}/>
  `;
}

export const BoxModal = Template.bind({});
BoxModal.storyName = 'BoxModal'
BoxModal.args = args

import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Merchant/StatusWidget",
  parameters: {
    docs: {
      description: {
        component:
          `The StatusWidget enables the display of transaction status in the backend of an online shop. The merchant gets a quick overview of the transaction status of an order via the StatusWidget. The StatusWidget can be integrated on the page where order details are displayed, but also in the list view to see the status of all displayed orders at a glance.
          
The Merchant StatusWidget requires initial configuration to retrieve transaction data, see MerchantManager`,
      }
    }    
  },
  argTypes: {
    txId: {
      description: 'the transaction ID of the easyCredit payment'
    },
    date: {
      description: 'Order date, used to distinguish between "not available" and "not yet available". The value must be parsable by Date.parse()'
    }
  }
};

let args = {
    txId: 'V3MDGE',
    date: ''
}
const Template = (args) => `<easycredit-merchant-status-widget ${buildAttributes(args).join(' ')} />`;

export const StatusWidgetNormal = Template.bind({});
StatusWidgetNormal.storyName = 'Standard'
StatusWidgetNormal.args = { ... args }

export const StatusWidgetNotAvailable = Template.bind({});
StatusWidgetNotAvailable.storyName = 'Not available'
StatusWidgetNotAvailable.args = { ... args, ... {
    txId: 'xyz'
}}

export const StatusWidgetNotYetAvailable = Template.bind({});
StatusWidgetNotYetAvailable.storyName = 'Not yet available (< 1 day)'
StatusWidgetNotYetAvailable.args = { ... args, ... {
    date: new Date().toISOString()
}}

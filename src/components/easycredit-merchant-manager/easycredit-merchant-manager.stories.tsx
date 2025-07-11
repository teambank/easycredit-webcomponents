import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Merchant/Manager",
  parameters: {
    docs: {
      description: {
        component: `The Merchant Manager enables the merchant to easily process transactions via their shop backend. Typically, it is displayed in the shop system in the order detail view or in the area of transactions for an order.
        
To be able to retrieve transactions, the endpoints and authentication must be specified for the Merchant Manager. This can be done, for example, globally on the page via a script tag, see [Configuration via global variable](?path=/docs/getting-started-configuration--docs).
        `,
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
  },
};

let args = {
    txId: 'V3MJ44',
    date: ''
}

const Template = (args) => `<easycredit-merchant-manager ${buildAttributes(args).join(' ')} />`

export const ManagerNormal = Template.bind({})
ManagerNormal.storyName = 'Standard'
ManagerNormal.args = { ... args }

export const ManagerNotAvailable = Template.bind({})
ManagerNotAvailable.storyName = 'Not available'
ManagerNotAvailable.args = { ... args, ... {
    txId: 'xyz'
}}

export const ManagerNotYetAvailable =  Template.bind({})
ManagerNotYetAvailable.storyName = 'Not yet available (< 1 day)'
ManagerNotYetAvailable.args = { ... args, ... {
  txId: 'xyz',
  date: new Date().toISOString()
}}

import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Marketing/Infopage",
  parameters: {
    docs: {
      description: {
        component:
          "The Infopage component enables easy integration of a payment method page for installment purchase in the shop's frontend. It explains installment purchase in detail and contains all information that is interesting for your customers.",
      }
    }    
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'enhanced'],
      description: 'The visual variant of the Infopage component',
      table: {
        defaultValue: { summary: 'enhanced' }
      }
    },
    paymentTypes: {
      control: 'select',
      options: [METHODS.INSTALLMENT, METHODS.BILL, `${METHODS.INSTALLMENT},${METHODS.BILL}`],
      description: 'Available payment types',
      table: {
        defaultValue: { summary: `${METHODS.INSTALLMENT},${METHODS.BILL}` }
      }
    }
  },
};

const Template = (args) => {
  // Ensure paymentTypes is properly passed as an attribute
  const attributes = buildAttributes(args);
  // Add debug logging
  console.log('Story template args:', args);
  console.log('Built attributes:', attributes);
  return `<easycredit-infopage ${attributes.join(' ')} />`;
};

export const Default = Template.bind({});
Default.storyName = 'Standard variant';
Default.args = {
//  variant: 'default',
//  paymentTypes: `${METHODS.INSTALLMENT},${METHODS.BILL}`
};

export const Enhanced = Template.bind({});
Enhanced.storyName = 'Enhanced variant';
Enhanced.args = {
  variant: 'enhanced',
  paymentTypes: `${METHODS.INSTALLMENT},${METHODS.BILL}`
};

// Add specific stories for single payment type scenarios
export const InstallmentOnly = Template.bind({});
InstallmentOnly.storyName = 'Installment only';
InstallmentOnly.args = {
  variant: 'enhanced',
  paymentTypes: METHODS.INSTALLMENT
};

export const BillOnly = Template.bind({});
BillOnly.storyName = 'Bill only';
BillOnly.args = {
  variant: 'enhanced',
  paymentTypes: METHODS.BILL
};

import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Marketing/Infopage",
  parameters: {
    docs: {
      description: {
        component:
          "Die Infopage-Komponente ermöglicht die einfache Integration einer Zahlungsartenseite für den Ratenkauf im Frontend des Shops. Sie erklärt den Ratenkauf im Detail und enthält alle Informationen, die für Ihre Kunden interessant sind.",
      }
    }    
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'enhanced'],
      description: 'Die visuelle Variante der Infopage-Komponente',
      table: {
        defaultValue: { summary: 'enhanced' }
      }
    },
    paymentTypes: {
      control: 'select',
      options: [METHODS.INSTALLMENT, METHODS.BILL, `${METHODS.INSTALLMENT},${METHODS.BILL}`],
      description: 'Verfügbare Zahlungsarten',
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
Default.storyName = 'Standard-Variante';
Default.args = {
//  variant: 'default',
//  paymentTypes: `${METHODS.INSTALLMENT},${METHODS.BILL}`
};

export const Enhanced = Template.bind({});
Enhanced.storyName = 'Erweiterte Variante';
Enhanced.args = {
  variant: 'enhanced',
  paymentTypes: `${METHODS.INSTALLMENT},${METHODS.BILL}`
};

// Add specific stories for single payment type scenarios
export const InstallmentOnly = Template.bind({});
InstallmentOnly.storyName = 'Nur Ratenkauf';
InstallmentOnly.args = {
  variant: 'enhanced',
  paymentTypes: METHODS.INSTALLMENT
};

export const BillOnly = Template.bind({});
BillOnly.storyName = 'Nur Rechnung';
BillOnly.args = {
  variant: 'enhanced',
  paymentTypes: METHODS.BILL
};

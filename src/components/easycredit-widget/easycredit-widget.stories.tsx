import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Marketing/Widget",
  parameters: {
    docs: {
      description: {
        component:
          "The widget component is typically shown on the product detail page, but can also be integrated in the cart or product overview. It calculates the lowest possible installment with which a product at a certain price can be financed. When clicking on \"more info\", the installment calculator opens with further details about the financing. If the product price is outside the possible financing amounts, the widget can optionally indicate the minimum or maximum possible financing amount.",
      }
    }    
  },
  argTypes: {
    webshopId: {
      description: 'the identifier of the webshop'
    },
    amount: {
      description: 'the amount to be financed for which the installment is to be displayed, usually the product price'
    },
    paymentTypes: {
      description: 'the payment methods to be considered, as a comma-separated list',
      table: {
        defaultValue: { summary: 'INSTALLMENT,BILL' },
      },
       control: 'check', options: [METHODS.INSTALLMENT, METHODS.BILL]
    },
    extended: {
      description: 'determines whether the widget is displayed outside the amount limits (optional)',
      defaultValue: 'false',
      table: {
        category: 'optional',
        defaultValue: { summary: 'true' }
      }
    },
    displayType: {
      description: 'this option allows an alternative display variant to be selected',
      control: 'radio',
      options: ['normal', 'clean', 'minimal'],
      table: {
        category: 'optional',
        defaultValue: { summary: 'normal' },
      }
    },
    disableFlexprice: {
      description: 'if this option is set, interest flexibility is not considered in the calculation',
      table: {
        category: 'optional',
        defaultValue: { summary: 'false' },
      }
    }
  }
};

let args = {
  webshopId: '2.de.9999.9999',
  amount: 500,
  extended: true,
  displayType: '',
  disableFlexprice: false
}
const Template = (args) => `<easycredit-widget ${buildAttributes(args).join(' ')} />`;

const TemplateFirst = (args) => {
  return (
    `
  <label for="financingAmount">Financing amount:</label>
  <input id="financingAmount"  type="number" onKeyup="this.parentElement.querySelector('easycredit-widget').setAttribute('amount', this.value);" />
  <br /><br />

  ` + Template(args)
  );
}

export const WidgetNormal = TemplateFirst.bind({});
WidgetNormal.storyName = 'Standard'
WidgetNormal.args = args

export const WidgetFull = Template.bind({});
WidgetFull.storyName = 'both payment types';
WidgetFull.args = {
  ...args,
  paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`
};

export const WidgetBillPayment = Template.bind({});
WidgetBillPayment.storyName = 'invoice purchase only';
WidgetBillPayment.args = {
  ...args,
  paymentTypes: METHODS.BILL,
};

export const WidgetInstallmentPayment = Template.bind({});
WidgetInstallmentPayment.storyName = 'installment purchase only';
WidgetInstallmentPayment.args = {
  ...args,
  paymentTypes: METHODS.INSTALLMENT,
};

export const WidgetBelowInstallments = Template.bind({});
WidgetBelowInstallments.storyName = 'Boundary display (50 - 199 EUR)';
WidgetBelowInstallments.args = {
  ...args,
  ...{
    amount: 198,
    paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`
  },
};

export const WidgetAboveBill = Template.bind({});
WidgetAboveBill.storyName = 'Boundary display (5001 - 9999 EUR)';
WidgetAboveBill.args = {
  ...args,
  ...{
    amount: 6000,
    paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`
  },
};

export const WidgetBelow = Template.bind({});
WidgetBelow.storyName = 'Boundary display (< 50 EUR)';
WidgetBelow.args = {
  ...args,
  ...{
    amount: 49,
    paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`
  },
};

export const WidgetAbove = Template.bind({});
WidgetAbove.storyName = 'Boundary display (> 10,000 EUR)';
WidgetAbove.args = { ... args, ... {
  amount: 12000,
  paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`
}}

export const WidgetExtended = Template.bind({});
WidgetExtended.storyName = 'outside amount limit, do not display'
WidgetExtended.args = { ... args, ... {
  amount: 12000,
  paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`,
  extended: false
}}

export const WidgetDisplayTypeClean = Template.bind({});
WidgetDisplayTypeClean.storyName = 'displayType: clean'
WidgetDisplayTypeClean.args = { ... args, ... {
  amount: 500,
  displayType: 'clean',
  paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`
}}

export const WidgetDisplayTypeMinimal = Template.bind({});
WidgetDisplayTypeMinimal.storyName = 'displayType: minimal'
WidgetDisplayTypeMinimal.args = { ... args, ... {
  amount: 500,
  displayType: 'minimal',
  paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`
}}

export const WidgetWithoutFlexprice = Template.bind({});
WidgetWithoutFlexprice.storyName = 'without interest flex'
WidgetWithoutFlexprice.args = { ... args, ... {
  amount: 500,
  disableFlexprice: true,
  paymentTypes: `${METHODS.BILL},${METHODS.INSTALLMENT}`
}}

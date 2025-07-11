import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
  title: "Checkout/Checkout",
  parameters: {
    docs: {
      description: {
        component:
          `The checkout component enables interaction with easyCredit directly in the online shop, even before redirecting to the PaymentPage. The component is typically used in conjunction with the checkout label and is only displayed when the customer has selected the payment method in the payment method selection. The component contains a modal that allows the customer to consent to data transfer before being redirected to the PaymentPage. The declaration of consent is personalized for the respective merchant and is obtained dynamically.
          
As soon as the customer has completed the PaymentPage, the widget displays the customer's selection (${'`paymentPlan`'}). For installment purchase, the selected installments are shown; for bill payment, the timeline until actual payment is displayed. If an error has occurred, e.g., if the amount is outside the allowed financing amounts, the corresponding error is displayed instead (${'`alert`'}).`,
      }
    }    
  },
  argTypes: {
    webshopId: {
      description: "the identifier of the webshop",
    },
    paymentType: {
      options: [METHODS.INSTALLMENT, METHODS.BILL],
      control: { type: 'radio' },
    },
    amount: {
      description: "the amount to be financed for which the installment selection should be displayed",
    },
    isActive: {
      description: "shows or hides the entire element",
      table: {
        defaultValue: { summary: 'true' }
      }
    },
    alert: {
      description: "if this attribute is set, its content is displayed as a message",
    },
    paymentPlan: {
      description: "expects the JSON-formatted TransactionSummary object (see GET /api/payment/v3/transaction/{technicalTransactionId}))'",
    },
    submit: {
      name: 'easycredit-submit',
      action: 'easycredit-submit',
      table: {
        category: "Events",
      },
      description: "Triggered when 'Akzeptieren' / 'Weiter zum Rechnungskauf' / 'Weiter zum Ratenkauf' is clicked",
    }
  },
};

let args = {
    webshopId: '2.de.9999.9999',
    amount: 820.31,
    isActive: true,
    alert: '',
    paymentPlan: '',
    paymentType: METHODS.INSTALLMENT
}

const Template = (args) => {
  delete args.submit;
  return `
    <easycredit-checkout ${buildAttributes(args).join(' ')} />
  `
}

const TemplateExample = (args) => {
  return Template(args) + `
  <script>
  document.addEventListener('easycredit-submit', (e) => {
    if (!e.target.matches('easycredit-checkout')) {
      return;
    }

    // window.location.href = 'https://shopurl/easycredit/start';
    // or
    // document.querySelector('form.my-form').submit();

    alert([
      'submitted successfully!',
      JSON.stringify(e.detail, null, 2)
    ].join("\n\n"));

  });
  </script>
  `
}

export const CheckoutInitial = TemplateExample.bind({})
CheckoutInitial.storyName = 'Installment purchase (initial)'
CheckoutInitial.args = args

export const CheckoutCalculated = Template.bind({})
CheckoutCalculated.storyName = 'Installment purchase (calculated)'
CheckoutCalculated.args = { ...args, ... {
    paymentPlan: '{"orderValue":7702.06,"interest":1803.42,"totalValue":9505.48,"decisionOutcome":"POSITIVE","numberOfInstallments":60,"installment":159,"lastInstallment":124.48,"mtan":{"required":false,"successful":false},"bankAccountCheck":{"required":false}}'
}}

export const CheckoutInitialBillPayment = TemplateExample.bind({})
CheckoutInitialBillPayment.storyName = 'Invoice purchase (initial)'
CheckoutInitialBillPayment.args = {
  ...args, ... {
    paymentType: METHODS.BILL
  }
}

export const CheckoutCalculatedBillPayment = Template.bind({})
CheckoutCalculatedBillPayment.storyName = 'Invoice purchase (calculated)'
CheckoutCalculatedBillPayment.args = {
  ...args, ... {
    paymentType: METHODS.BILL,
    paymentPlan: '{"orderValue":7702.06,"interest":1803.42,"totalValue":9505.48,"decisionOutcome":"POSITIVE","numberOfInstallments":60,"installment":159,"lastInstallment":124.48,"mtan":{"required":false,"successful":false},"bankAccountCheck":{"required":false}}'
  }
}

export const CheckoutError = Template.bind({})
CheckoutError.storyName = 'Error'
CheckoutError.args = args
CheckoutError.args = { ... args, ... {
    alert: 'An error has occurred.'
}}

/*
export const CheckoutWithoutFlexprice = Template.bind({})
CheckoutWithoutFlexprice.storyName = 'without interest flex'
CheckoutWithoutFlexprice.args = args
CheckoutWithoutFlexprice.args = { ... args, ... {
    disableFlexprice: true
}}
*/

import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
    title: "Checkout/ExpressButton",
    parameters: {
        docs: {
            description: {
                component: 'The express button for easyCredit can be integrated on product pages or in the shopping cart to start the payment process directly from there.',
            }
        }
    },
    argTypes: {
        webshopId: {
            description: 'the identifier of the webshop'
        },
        amount: {
            description: 'the amount to be financed for which the express button should be displayed. If the amount is outside the allowed limits, the button is hidden.'
        },
        paymentTypes: {
            description: 'the payment methods to be considered, as a comma-separated list',
            table: {
                defaultValue: { summary: [] },
                category: "optional",
            },
            control: 'check', options: [METHODS.INSTALLMENT, METHODS.BILL]
        },
        fullWidth: {
            table: {
                defaultValue: { summary: "false" },
                category: "optional",
            },
            description: "Displays the button across 100% of the available width."
        },
        submit: {
            name: 'easycredit-submit',
            action: 'easycredit-submit',
            table: {
                category: "Events",
            },
            description: "Triggered when 'Accept' is clicked",
        }
    },
}

let args = {
    webshopId: '2.de.9999.9999',
    amount: 299,
    fullWidth: false,
    // redirectUrl: 'https://easycredit-ratenkauf.de/'
    paymentTypes: ''
}

const Template = (args) => {
    delete args.submit;
    return `<easycredit-express-button ${buildAttributes(args).join(' ')} />

  <script>
  document.addEventListener('easycredit-submit', (e) => {
    if (!e.target.matches('easycredit-express-button')) {
      return;
    }
    // window.location.href = 'https://shopurl/easycredit/express';
    // or
    // document.querySelector('form.my-form').submit();

    alert([
      'submitted successfully!',
      JSON.stringify(e.detail, null, 2)
    ].join("\n\n"));
  });
  </script>
  `;
}

export const ExpressButtonNormal = Template.bind({});
ExpressButtonNormal.storyName = 'Standard'
ExpressButtonNormal.args = args

export const ExpressButtonBoth = Template.bind({});
ExpressButtonBoth.storyName = 'both payment types'
ExpressButtonBoth.args = {
  ...args, ... {
    paymentTypes: [METHODS.BILL,METHODS.INSTALLMENT].join(',')
  }
}

export const ExpressButtonInstallment = Template.bind({});
ExpressButtonInstallment.storyName = 'installment only'
ExpressButtonInstallment.args = args
ExpressButtonInstallment.args = {
  ...args, ... {
    paymentTypes: METHODS.INSTALLMENT
  }
}

export const ExpressButtonBill = Template.bind({});
ExpressButtonBill.storyName = 'bill only'
ExpressButtonBill.args = {
  ...args, ... {
    paymentTypes: METHODS.BILL
  }
}

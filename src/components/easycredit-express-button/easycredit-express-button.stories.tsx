import { buildAttributes } from '../../../.storybook/helpers'
import { METHODS } from '../../types';

export default {
    title: "Checkout/ExpressButton",
    parameters: {
        docs: {
            description: {
                component: 'Der Express Button für easyCredit kann auf Produktseiten oder im Warenkorb integriert werden, um direkt von dort aus aus den Bezahlvorgang zu starten.',
            }
        }
    },
    argTypes: {
        webshopId: {
            description: 'die Kennung des Webshops'
        },
        amount: {
            description: 'der zu finanzierende Betrag, für den der Express-Button angezeigt werden soll. Ist der Betrag außerhalb der erlaubten Betragsgrenzen, wird der Button ausgeblendet.'
        },
        paymentTypes: {
            description: 'die zu berücksichtigenden Zahlungsmethoden, als komma-getrennte Liste',
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
            description: "Zeigt den Button über 100% der zur Verfügung stehenden Breite an."
        },
        submit: {
            action: 'submit',
            table: {
                category: "Events",
            },
            description: "Wird ausgelöst bei Klick auf 'Akzeptieren'",
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
  document.querySelector('easycredit-express-button').addEventListener('submit', (e) => {
    // window.location.href = 'https://shopurl/easycredit/express';
    // or
    // document.querySelector('form.my-form').submit();

    alert([
      'submitted successfully!',
      JSON.stringify(e.detail, null, 2)
    ].join("\\n\\n"));
  });
  </script>
  `;
}

export const ExpressButtonNormal = Template.bind({});
ExpressButtonNormal.storyName = 'Standard'
ExpressButtonNormal.args = args

export const ExpressButtonBoth = Template.bind({});
ExpressButtonBoth.storyName = 'beide Zahlarten'
ExpressButtonBoth.args = {
  ...args, ... {
    paymentTypes: [METHODS.BILL,METHODS.INSTALLMENT].join(',')
  }
}

export const ExpressButtonInstallment = Template.bind({});
ExpressButtonInstallment.storyName = 'nur Ratenkauf'
ExpressButtonInstallment.args = args
ExpressButtonInstallment.args = {
  ...args, ... {
    paymentTypes: METHODS.INSTALLMENT
  }
}

export const ExpressButtonBill = Template.bind({});
ExpressButtonBill.storyName = 'nur Rechnung'
ExpressButtonBill.args = {
  ...args, ... {
    paymentTypes: METHODS.BILL
  }
}

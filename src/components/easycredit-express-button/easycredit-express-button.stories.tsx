import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Checkout/ExpressButton",
  parameters: {
    docs: {
      description: {
        component: 'Der Express Button für den easyCredit-Ratenkauf kann auf Produktseiten oder im Warenkorb integriert werden, um direkt von dort aus aus den Bezahlvorgang zu starten.',
      }
    }
  },
  argTypes: {
    // bgBlue: {
    //   defaultValue: { summary: "false" },
    //   description: "Wechselt die Hintergrundfarbe des Buttons von \"eC Orange\" auf \”eC Primärblau\"."
    // },
    webshopId: {
      description: 'die Kennung des Webshops'
    },
    amount: {
      description: 'der zu finanzierende Betrag, für den der Express-Button angezeigt werden soll. Ist der Betrag außerhalb der erlaubten Betragsgrenzen, wird der Button ausgeblendet.'
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
  // bgBlue: false,
  fullWidth: false,
  // redirectUrl: 'https://easycredit-ratenkauf.de/'
}

const Template = (args) => {
  delete args.submit;
  return `<easycredit-express-button ${buildAttributes(args).join(' ')} />

  <script>
  document.querySelector('easycredit-express-button').addEventListener('submit',function() {
    // window.location.href = 'https://shopurl/easycredit/express';
    // or
    // document.querySelector('form.my-form').submit();
  });
  </script>
  `;
}
export const ExpressButton = Template.bind({});
ExpressButton.storyName = 'ExpressButton'
ExpressButton.args = args

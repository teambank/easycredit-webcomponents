import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/BoxModal",
  parameters: {
    docs: {
      description: {
        component:
          "Die Modal-Komponente kann eingesetzt werden, um einen Kunden an einer bestimmten Stelle im Shop aktiv auf den Ratenkauf hinzuweisen. Ein zeitgesteuertes Einblenden des Modals ist möglich. Schliesst der Kunde das Modal, merkt die Komponente sich dies und verhindert ein weiteres Anzeigen.",
      }
    }    
  },
  argTypes: {
    src: {
      description: 'ersetzt das Standard-Bild durch eine benutzerdefinierte Grafik (Format Retina: mind. 700 x 460)'
    },
    isOpen: {
      description: 'mit dieser Option kann das Modal geöffnet und geschlossen werden'
    },
    delay: {
      description: 'sofern hier ein Wert angegeben ist, wird das Modal nach Ablauf dieser Zeit automatisch geöffnet (Angabe in Millisekunden). Ist der Wert nicht angegeben, öffnet sich das Modal nicht automatisch.'
    },
    snoozeFor: {
      description: 'nach Ablauf dieser Zeit wird das Modal beim Laden der Seite erneut eingeblendet, wenn der Nutzer es bereits geschlossen hat (Angabe in Sekunden), nur in Verbindung mit openDelay'
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

import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/BoxFlash",
  parameters: {
    docs: {
      description: {
        component:
          "Mit dieser Marketing-Komponente lässt sich ein Banner zur Bewerbung des Ratenkaufs am unteren Bildschirmrand einblenden. Der Banner zeigt ein Standardbild, das sich über das src-Attribut überschreiben lässt. So können Händler ein zu ihrem Produktangebot passendes Bild verwenden.",
      },
    }    
  },
  argTypes: {
    src: {
      description: 'ersetzt das Standard-Bild durch eine benutzerdefinierte Grafik (Format Retina: mind. 240 x 360)'
    }
  }
}

let args = {
    src: '',
    isOpen: false
}

const Template = (args) => `
  <button onClick="this.parentElement.querySelector('easycredit-box-flash').setAttribute('is-open',true);">Open Flashbox</button>
  
  <easycredit-box-flash ${buildAttributes(args).join(' ')} />
`;
export const BoxFlash = Template.bind({});
BoxFlash.storyName = 'BoxFlash'
BoxFlash.args = args

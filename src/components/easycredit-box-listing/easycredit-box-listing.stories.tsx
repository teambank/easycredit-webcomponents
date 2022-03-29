import { buildAttributes } from '../../../.storybook/helpers'

export default {
  title: "Marketing/BoxListing",
  parameters: {
    docs: {
      description: {
        component:
          "Mit der Listing-Komponente kann innerhalb der Produktliste ein Produkt durch einen Banner zur Bewerbung des Ratenkaufs ersetzt werden. Der Banner zeigt ein Standardbild, das sich über das src-Attribut überschreiben lässt. So können Händler ein zu ihrem Produktangebot passendes Bild verwenden.",
      }
    }    
  },
  argTypes: {
    src: {
      description: 'ersetzt das Standard-Bild durch eine benutzerdefinierte Grafik (Format Retina: mind. 600 x 574)'
    }
  }
}

let args = {
    src: ''
}

const Template = (args) => `<easycredit-box-listing ${buildAttributes(args).join(' ')} />`;
export const BoxListing = Template.bind({});
BoxListing.storyName = 'BoxListing'
BoxListing.args = args

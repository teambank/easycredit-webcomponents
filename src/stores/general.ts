import { createStore } from "@stencil/store";
import { WebshopInfo } from '../types'

const { state /*, onChange*/ } = createStore({
    webshopInfo: null as WebshopInfo
});

export default state;
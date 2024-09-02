import { defineCustomElements } from "../dist/esm/loader";
defineCustomElements();

export const parameters = {
  // actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewMode: 'docs',
  docs: {
    canvas: {
      sourceState: 'shown'
    }
  }
}
export const tags = ['autodocs'];

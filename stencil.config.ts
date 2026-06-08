import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'easycredit-components',
  extras: {
    scriptDataOpts: true,
    appendChildSlotFix: false,
    cloneNodeFix: false,
    slotChildNodesFix: true,
  },
  plugins: [
    sass({
      injectGlobalPaths: [
        `${__dirname}/src/globals/base.scss`
      ]
    })
  ],
  bundles: [
    { components: ['easycredit-infopage', 'easycredit-faq', 'easycredit-accordion-item', 'easycredit-accordion'] },
    { components: ['easycredit-box-flash', 'easycredit-box-listing', 'easycredit-box-modal', 'easycredit-box-top'] },
    { components: ['easycredit-widget', 'easycredit-checkout', 'easycredit-checkout-installments', 'easycredit-modal'] },
    { components: ['easycredit-merchant-manager', 'easycredit-merchant-status-widget'] }
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    /**
     * Node hydrate bundle for server-side HTML (e.g. scripts/prerender-server + PHP).
     */
    {
      type: 'dist-hydrate-script',
      dir: 'hydrate',
    },
    {
      type: 'docs-readme',
    }
  ]
}

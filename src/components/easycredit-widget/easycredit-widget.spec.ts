import { newSpecPage } from '@stencil/core/testing';
import { EasycreditWidget } from './easycredit-widget';

describe('easycredit-widget', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [EasycreditWidget],
      html: '<easycredit-widget></easycredit-widget>',
    });
    expect(root).toEqualHtml(`
      <easycredit-widget>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </easycredit-widget>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [EasycreditWidget],
      html: `<easycredit-widget first="Stencil" last="'Don't call me a framework' JS"></easycredit-widget>`,
    });
    expect(root).toEqualHtml(`
      <easycredit-widget first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </easycredit-widget>
    `);
  });
});

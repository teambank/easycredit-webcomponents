export default {
  stories: [
    './stories/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  staticDirs: ['../dist'],
  docs: {},
  async viteFinal(config, { configType }) {
    if (configType === 'PRODUCTION') {
      config.base = '/docs/easycredit-components/';
    }
    return config;
  },
};

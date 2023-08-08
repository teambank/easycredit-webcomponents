module.exports = {
  "stories": ["./stories/*.stories.mdx", "../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  "addons": ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-mdx-gfm"],
  "framework": {
    name: "@storybook/html-webpack5",
    options: {}
  },
  "webpackFinal": async (config, {
    configType
  }) => {
    config.module.rules.push({
      test: /\.js$/,
      loader: require.resolve('@open-wc/webpack-import-meta-loader')
    });
    return config;
  },
  staticDirs: ['../dist'],
  docs: {
    autodocs: true
  }
};
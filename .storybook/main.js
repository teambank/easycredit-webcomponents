module.exports = {
  "stories": [
    "./stories/*.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@chromatic-com/storybook"
  ],
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

    config.module.rules.push({
      test: /\.mdx?$/,
      use: [{ loader: "babel-loader" }, { loader: '@mdx-js/loader' }],
      exclude: /node_modules/,
      include: [/src/]
    });

    return config;
  },
  staticDirs: ['../dist'],
  docs: {
    autodocs: true
  }
};

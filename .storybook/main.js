module.exports = {
  "stories": [
    "./stories/*.stories.mdx",
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
  ],
  "framework": "@storybook/html",
  "webpackFinal": async (config, { configType }) => {
    config.module.rules.push({
      test: /\.js$/,
      loader: require.resolve('@open-wc/webpack-import-meta-loader'),
    })
    return config
  }
}

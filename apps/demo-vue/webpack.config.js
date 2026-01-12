const webpack = require('@nativescript/webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (env) => {
  webpack.init(env);
  webpack.useConfig('vue');

  // Add the ForkTsCheckerWebpackPlugin before nativescript-vue tries to use it
  webpack.chainWebpack((config) => {
    // Polyfill Node core modules for Webpack 5 (used by various dependencies)
    if (config.resolve && config.resolve.fallback) {
      config.resolve.fallback.set('url', require.resolve('url/'));
      config.resolve.fallback.set('util', require.resolve('util/'));
    }

    config.plugin('ForkTsCheckerWebpackPlugin').use(ForkTsCheckerWebpackPlugin, [
      {
        typescript: {
          configFile: 'tsconfig.json',
          memoryLimit: 4096,
        },
      },
    ]);
  });

  return webpack.resolveConfig();
};

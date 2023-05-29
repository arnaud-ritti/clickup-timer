const CopyPlugin = require('copy-webpack-plugin');
const alias = require('./webpack.alias');
const rules = require('./webpack.rules');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.js',
  output: {
    // [file] is the key thing here. [query] and [fragment] are optional
    assetModuleFilename: '[file][query][fragment]', 
  },
  resolve: {
    alias,
  },
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/assets/', to: 'assets/' },
        { from: 'src/locales/', to: 'locales/' },
      ],
    }),
  ],
};
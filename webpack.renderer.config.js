const alias = require('./webpack.alias');
const rules = require('./webpack.rules');
const { VueLoaderPlugin } = require('vue-loader')
const CopyPlugin = require('copy-webpack-plugin');

rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' }, 
    { loader: 'css-loader' },
    { loader: 'postcss-loader' }
  ],
});

module.exports = {
  // Put your normal webpack config below here
  resolve: {
    alias
  },
  module: {
    rules,
  },
  plugins: [
    // make sure to include the plugin!
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/assets/', to: 'assets/' },
        { from: 'src/locales/', to: 'locales/' },
      ],
    }),
  ]
};

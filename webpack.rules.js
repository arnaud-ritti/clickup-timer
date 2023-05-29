module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.vue$/,
    loader: "vue-loader",
  },
  {
    test: /\.(gif|icns|ico|jpe?g|png|svg|otf|eot|woff|woff2|ttf)(\?[a-z0-9=.]+)?$/,    
    loader: 'url-loader' 
  },
  {
    // Note: I dont have `svg` here because I run my .svg through the `@svgr/webpack` loader, 
    // but you can add it if you have no special requirements
    test: /\.(gif|icns|ico|jpe?g|png|svg|otf|eot|woff|woff2|ttf)(\?[a-z0-9=.]+)?$/,    
    type: 'asset/resource',
  },
  // Put your webpack loader rules in this array.  This is where you would put
  // your ts-loader configuration for instance:
  /**
   * Typescript Example:
   *
   * {
   *   test: /\.tsx?$/,
   *   exclude: /(node_modules|.webpack)/,
   *   loaders: [{
   *     loader: 'ts-loader',
   *     options: {
   *       transpileOnly: true
   *     }
   *   }]
   * }
   */
];

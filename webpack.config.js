const {resolve} = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'encrypt-storage',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    'crypto': 'crypto',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: '/node_modules/'
    }]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./README.MD", to: "README.MD" },
        { from: "./LICENSE", to: "LICENSE.txt" },
      ],
    }),
  ],
}

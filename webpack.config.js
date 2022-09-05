const webpack = require("webpack");
const { resolve } = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'encrypt-storage',
    libraryTarget: 'umd',
    umdNamedDefine: true,

  },
  devtool: 'cheap-module-source-map',
  // devtool: 'nosources-source-map',
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify"),
      "url": require.resolve("url"),
      "buffer": require.resolve("buffer/")
    },
    alias: {
      process: "process/browser",
      path: require.resolve("path-browserify"),
    }
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: '/node_modules/'
    }]
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
   }),
    new CopyPlugin({
      patterns: [
        { from: "./README.md", to: "README.md" },
        { from: "./LICENSE", to: "LICENSE.txt" },
      ],
    }),
  ],
}

'use strict';

const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCSSPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');

const BUILD_DIR = path.resolve('build/');
const DEV = process.env.NODE_ENV === 'development';

const rules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'ts-loader',
  },
  {
    test: /\.s[ac]ss$/,
    use: [
      DEV ? 'style-loader' : MiniCSSPlugin.loader,
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [autoprefixer()],
        },
      },
      'sass-loader',
    ],
  },
  {
    test: /\.(svg|png|jpe?g)?$/,
    loader: 'file-loader',
  },
];

const config = {
  mode: process.env.NODE_ENV,
  entry: path.resolve('src/'),
  output: {
    path: BUILD_DIR,
    filename: 'index.js',
  },
  module: { rules },
  plugins: [
    new HTMLPlugin({ template: './public/index.html' }),
    new CopyPlugin([
      {
        from: path.resolve('public/'),
        to: BUILD_DIR,
        ignore: ['index.html'],
      },
    ]),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {},
  },
  devtool: DEV ? 'sourcemap' : false,
  devServer: {
    port: 3000,
    historyApiFallback: true,
    stats: 'minimal',
  },
  optimization: {
    minimize: false,
  }
};

if (!DEV) {
  config.plugins.push(new MiniCSSPlugin({}));
}

module.exports = config;

'use strict';

const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCSSPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const dotenv = require('dotenv');
const { EnvironmentPlugin } = require('webpack');

const BUILD_DIR = path.resolve('build/');
const DEV = process.env.NODE_ENV === 'development';

const rules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'ts-loader',
  },
  {
    test: /\.wasm$/,
    type: "webassembly/experimental",
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
    options: {
      name: '[hash].[ext]',
      outputPath: 'assets/',
    },
  },
];

function getAliases() {
  const tsconfig = require('./tsconfig.json');
  const {
    compilerOptions: { paths = [] },
  } = tsconfig;
  const aliases = {};
  for (const k in paths) {
    const key = k.replace(/\/\*$/, '');
    const value = paths[k][0].replace(/(\/?\*)/, '');
    aliases[key] = path.resolve(__dirname, value);
  }
  return aliases;
}

const config = {
  mode: process.env.NODE_ENV,
  entry: path.resolve('src/'),
  
  output: {
    path: BUILD_DIR,
    filename: 'js/[name]-[chunkhash].js',
    publicPath: '/',
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
    new EnvironmentPlugin(dotenv.config().parsed),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.wasm'],
    alias: getAliases(),
  },
  devtool: DEV ? 'sourcemap' : false,
  devServer: {
    port: 3000,
    historyApiFallback: true,
    stats: 'minimal',
  },
  optimization: {
    minimize: false,
  },
};

if (!DEV) {
  config.plugins.push(new MiniCSSPlugin({ filename: 'css/[chunkhash].css' }));
}

module.exports = config;

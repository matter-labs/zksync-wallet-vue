'use strict';

const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCSSPlugin = require('mini-css-extract-plugin');
const ImageminWebpPlugin = require("imagemin-webp-webpack-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const autoprefixer = require('autoprefixer');
const dotenv = require('dotenv');
const { EnvironmentPlugin } = require('webpack');
const packageJson = require('./package.json');
const { execSync } =  require('child_process');
const fs = require('fs');

const BUILD_DIR = path.resolve('build/');
const DEV = process.env.NODE_ENV === 'development';

const gitCommand = 'git rev-parse HEAD';

const getGitCommitHash = () => {
  return execSync(gitCommand).toString().trim();
}

const _hash = JSON.stringify(getGitCommitHash()).replace(/"/g, '');

process.env.REACT_APP_GIT_REVISION = _hash;

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
    loader: 'url-loader',
    options: {
      name: '[hash].[ext]',
      outputPath: 'assets/',
      limit: 8192,
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
    new EnvironmentPlugin({
      ...dotenv.config().parsed,
      VERSION: packageJson.version,
    }),
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
  config.plugins.push(
    new MiniCSSPlugin({ filename: 'css/[chunkhash].css' }),
    new ImageminPlugin({
      test: /\.(jpe?g|png)/,
      cacheFolder: './.assets_cache',
      disable: process.env.NODE_ENV !== 'production', // Disable during development
      minFileSize: 2000, // Only apply this one to files over 2kb
      pngquant: {
        speed: '1',
        strip: true
      },
      jpegtran: {
        progressive: true,
        arithmetic: true
      },
    }),
    new ImageminWebpPlugin({
      config: [{
        test: /\.(jpe?g|png)/,
        options: {
          quality:  80
        }
      }],
      overrideExtension: true,
      detailedLogs: false,
      silent: false,
      strict: true
    }),
    new CompressionPlugin({
      filename: '[path].br[query]',
      algorithm: 'brotliCompress',
      test: /\.(html|css|js|json|ttf|eot|woff|woff2|ico|png|svg|webp|jpg|wasm)$/,
      compressionOptions: {level: 11},
      threshold: 512,
      minRatio: 0.95,
      cache: './.brotli_cache',
    }),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(html|css|js|json|ttf|eot|woff|woff2|ico|png|svg|webp|jpg|wasm)$/,
      compressionOptions: {level: 9},
      threshold: 512,
      minRatio: 0.95,
      cache: './.gzip_cache',
    }),
  );
}

module.exports = config;
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  entry: {
    background: './src/background.ts',
    content: './src/content.tsx',
    popup: './src/popup.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: 'chunk-[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "process": require.resolve("process/browser"),
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util"),
      "assert": require.resolve("assert"),
      "fs": false,
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url"),
      "querystring": require.resolve("querystring-es3"),
      "vm": require.resolve("vm-browserify"),
      "constants": require.resolve("constants-browserify"),
      "domain": require.resolve("domain-browser"),
      "punycode": require.resolve("punycode"),
      "string_decoder": require.resolve("string_decoder"),
      "tty": require.resolve("tty-browserify"),
      "tls": false,
      "net": false,
      "child_process": false
    }
  },
  optimization: {
    // Disable code splitting for Chrome extensions to avoid chunk loading issues
    splitChunks: false,
    usedExports: true,
    sideEffects: false
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'popup.html', to: 'popup.html' },
        { from: 'assets', to: 'assets' },
        { from: 'icons', to: 'icons' },
        { from: 'src/styles.css', to: 'styles.css' },
      ],
    }),
    // Provide polyfill for process global
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    // Define process.env for browser environment
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        API_URL: process.env.API_URL || '',
        DEV_API: process.env.DEV_API || '',
        IS_DEV: process.env.IS_DEV || 'false',
        BASE_URL: process.env.API_URL,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
        GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || '',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
        FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || '',
        NODE_ENV: process.env.NODE_ENV || 'development'
      })
    }),
  ],
}; 
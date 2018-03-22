const path = require('path');
const webpack = require('webpack');

const config = {
  entry: {
    main: './src/mercury/index.jsx',
    background: ['babel-polyfill', './src/background/index.js']
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['env', 'react', 'stage-2']
        }
      },
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        loader: 'remove-flow-types-loader',
        include: path.join(__dirname, 'src')
      }
    ]
  },
  stats: {
    colors: true
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')]
  }
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: {
        warnings: false,
        drop_console: true
      }
    })
  );
} else {
  config.devtool = '#cheap-module-source-map';
}

module.exports = config;

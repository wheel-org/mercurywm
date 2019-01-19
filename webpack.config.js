const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const Constants = require('./src/constants.js');

// When adding any global constants via `webpack.definePlugin`,
// make sure to add its type definition in `flow-typed/mercurywm.js`
// so flow will understand it.

const config = {
  entry: {
    main: './src/mercury/index.jsx',
    background: './src/background/index.js',
    render: './src/render/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: '>1%, not ie 11, not op_mini all'
                }
              ],
              '@babel/preset-react',
              '@babel/preset-flow'
            ],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin(
      Object.keys(Constants).reduce(
        (acc, key) =>
          Object.assign(acc, {
            ['Constants.' + key]: JSON.stringify(Constants[key])
          }),
        {}
      )
    ),
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(process.env.NODE_ENV === 'production')
    })
  ],
  stats: {
    colors: true
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')]
  }
};

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production';
  config.optimization = {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  };
} else {
  config.mode = 'development';
  config.devtool = '#cheap-module-source-map';
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.UPDEEP_MODE': JSON.stringify('dangerously_never_freeze')
    })
  );
}

module.exports = config;

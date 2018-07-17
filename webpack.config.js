const path = require('path');
const webpack = require('webpack');

const Constants = require('./src/constants.js');

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
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: [
                        [
                            'env',
                            {
                                targets: {
                                    browser: 'last 2 versions'
                                }
                            }
                        ],
                        'react',
                        'stage-2'
                    ]
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
    plugins: [
        new webpack.DefinePlugin(
            Object.keys(Constants).reduce(
                (acc, key) => Object.assign(acc,
                    {
                        ['Constants.' + key]: JSON.stringify(Constants[key])
                    }
                ),
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
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false,
            compress: {
                warnings: false,
                drop_console: true
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    );
} else {
    config.devtool = '#cheap-module-source-map';
    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env.UPDEEP_MODE': JSON.stringify('dangerously_never_freeze')
        })
    );
}

module.exports = config;

let path = require('path');
let webpack = require('webpack');

module.exports = {
    entry: './src/index.jsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js'
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
            }
        ]
    },
    devtool: "#cheap-module-source-map",
    stats: {
        colors: true
    }
};

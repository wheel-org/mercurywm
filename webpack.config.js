let path = require('path');
let webpack = require('webpack');

const config = {
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
    plugins: [],
    stats: {
        colors: true
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
}
else {
    config.devtool = "#cheap-module-source-map";
}

module.exports = config;
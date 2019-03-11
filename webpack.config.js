const path = require('path');
// const babel-polyfill = require('babel-polyfill');

module.exports = {
    mode: 'development',
    entry: {
        main: ['babel-polyfill', './src/index.js']
    },
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: '[name].js'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }]
    }
};
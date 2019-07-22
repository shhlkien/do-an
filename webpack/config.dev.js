const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        index: './src/js/index.js',
        goodbye: './src/js/goodbye.js',
    },
    output: {
        filename: 'js/[contenthash:7].js',
        publicPath: '/assets/',
        path: path.resolve('assets'),
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader'
            ]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: 'css/[contenthash:7].css' }),
        new CopyPlugin([{
                from: './src/fonts',
                to: '/assets/fonts/'
            },
            {
                from: './src/favicon.ico',
                to: '/assets/'
            }
        ]),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
    }
};
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/js/index.js',
    goodbye: './src/js/goodbye.js',
  },
  output: {
    filename: 'js/[contenthash:7].js',
    publicPath: '/assets/',
    path: path.resolve('assets')
  },
  module: {
    rules: [{
        test: /\.s?[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(woff2?|ttf|eot|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]'
          }
        }]
      },
      {
        test: /\.(png|ico|jpe?g)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[contenthash:7].css' }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
  }
};
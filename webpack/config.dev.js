const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    admin: './src/js/admin.js',
    attendance: './src/js/attendance.js',
    home: './src/js/home.js',
    login: './src/js/login.js',
    models: './src/js/models.js',
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
            name: 'fonts/[hash:7].[ext]'
          }
        }]
      },
      {
        test: /\.(png|ico|jpe?g)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'images/[hash:7].[ext]'
          }
        }]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[contenthash:7].css' }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
  },
  node: {
    fs: "empty"
  }
};
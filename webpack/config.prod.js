const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
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
    path: path.resolve('assets'),
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
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ManifestPlugin({
      fileName: __dirname + '/manifest.json',
      generate: (seed, files) => {

        const manifest = {};

        for (file of files) {

          const name = file.name.replace(/(\.s?[ac]ss|\.js)$/, '');

          manifest[name] = manifest[name] || [];
          manifest[name].push(file.path);
        }

        return manifest;
      }
    }),
    new MiniCssExtractPlugin({ filename: 'css/[contenthash:7].css' }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimizer: [
      new TerserJSPlugin({
        cache: true,
        parallel: true,
      }),
      new OptimizeCSSAssetsPlugin()
    ],
  },
  node: {
    fs: "empty"
  }
};
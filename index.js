const express = require('express');

const app = express();
const router = require('./routes');

if (process.env.NODE_ENV !== 'production') {

  const webpackDevMiddleware = require('webpack-dev-middleware');

  const config = require('./webpack/config.dev');
  const compiler = require('webpack')(config);

  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    clientLogLevel: 'silent',
    serverSideRender: true,
    stats: 'errors-warnings',
    writeToDisk: false
  }));
}
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/model-images', express.static(__dirname + '/uploads'));
app.use('/lib', express.static(__dirname + '/node_modules'));
app.use('/', router);

app.listen(3000, console.log(`server is running at http://localhost:3000 (${process.env.NODE_ENV})`));
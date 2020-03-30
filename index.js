if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const compression = require('compression');
const mongoose = require('mongoose');

const app = express();
const routes = require('./routes');

mongoose.set('debug', process.env.DB_DEBUG);
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useFindAndModify: false }).catch(console.error);

if (process.env.NODE_ENV !== 'production') {

  const webpackDevMiddleware = require('webpack-dev-middleware');

  const config = require('./webpack/config.dev');
  const compiler = require('webpack')(config);

  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    clientLogLevel: 'silent',
    serverSideRender: true,
    stats: 'errors-only',
    writeToDisk: false
  }));
}
app.set('view engine', 'pug');
app.use(compression({ level: 9 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(__dirname + '/assets', { maxAge: process.env.COOKIE_MAXAGE }));
app.use('/model-images', express.static(__dirname + '/uploads', { maxAge: process.env.COOKIE_MAXAGE }));
app.use('/', routes);

app.listen(process.env.PORT, console.log(`server is running at http://localhost:${process.env.PORT} (${process.env.NODE_ENV})`));
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const compression = require('compression');
const { set, connect } = require('mongoose');

const app = express();
const routes = require('./routes');

set('debug', process.env.DB_DEBUG);
connect(process.env.DB_URL, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }).catch(console.error);

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
app.use(compression({ level: 9 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use('/assets', express.static(__dirname + '/assets', { maxAge: process.env.COOKIE_MAXAGE }));
app.use('/model-images', express.static(__dirname + '/uploads', { maxAge: process.env.COOKIE_MAXAGE }));
app.use('/', routes);

app.listen(process.env.PORT, console.log(`server is running at http://localhost:${process.env.PORT} (${process.env.NODE_ENV})`));
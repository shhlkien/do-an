const express = require('express');

const app = express();

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

app.use('/assets', express.static(__dirname + '/assets'));
app.set('view engine', 'pug');

const indexRouter = require('./routes/index-router');

app.use('/', indexRouter);

app.listen(3000, console.log(`server is running at http://localhost:3000 (${process.env.NODE_ENV})`));
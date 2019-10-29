const fs = require('fs');
const path = require('path');

/**
 * @res     response from server
 * @entries corresponding entries defined in webpack
 */
module.exports = (res, ...entries) => {

  let assets = process.env.NODE_ENV === 'production' ?
    JSON.parse(fs.readFileSync(path.resolve('webpack/manifest.json'), 'utf-8')) :
    res.locals.webpackStats.toJson().assetsByChunkName,
    css = [],
    js = [],
    asset = null;

  for (let i = entries.length; --i >= 0;) {

    asset = assets[entries[i]];
    asset = Array.isArray(asset) ? asset : [asset];

    let csses = asset.filter(path => path.indexOf('css') >= 0),
      jses = asset.filter(path => path.indexOf('js') >= 0);

    if (process.env.NODE_ENV !== 'production') {

      csses = csses.map(path => '/assets/' + path);
      jses = jses.map(path => '/assets/' + path);
    }

    css = [...css, ...csses];
    js = [...js, ...jses];
  }

  return { css, js };
}
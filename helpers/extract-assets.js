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
  // console.log(`extract-assets.js:16: `, assets)

  for (let i = entries.length; --i >= 0;) {

    asset = assets[entries[i]];
    asset = Array.isArray(asset) ? asset : [asset];

    // if (entries[i].indexOf('fonts') >= 0) {

    //   fonts = asset.map(path => process.env.NODE_ENV !== 'production' ? '/assets/' + path : path);
    //   continue;
    // }

    // if (entries[i].indexOf('favicon') >= 0) {

    //   favicon = process.env.NODE_ENV !== 'production' ? '/assets/' + asset[0] : asset[0];
    //   continue;
    // }

    let csses = asset.filter(path => path.indexOf('css') >= 0);
    let jses = asset.filter(path => path.indexOf('js') >= 0);

    if (process.env.NODE_ENV !== 'production') {

      csses = csses.map(path => '/assets/' + path);
      jses = jses.map(path => '/assets/' + path);
    }

    css = [...css, ...csses];
    js = [...js, ...jses];
  }

  return { css, js };
}
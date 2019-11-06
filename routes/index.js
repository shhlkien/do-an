const router = require('express').Router();
const extractAssets = require('../helpers/extract-assets');

router
  .get('/training', (req, res, next) => {

    const assets = extractAssets(res, 'training');
    res.render();
  })
  .get('/face-comparison', (req, res, next) => {

    const assets = extractAssets(res, 'face-comparison');
    // res.sendStatus(200);
    // console.table(res.locals.webpackStats.toJson().assets, ['name', 'chunks', 'chunkNames'])
    res.render('face-comparison', assets);
  });

module.exports = router;
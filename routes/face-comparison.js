const router = require('express').Router();

const extractAssets = require('../helpers/extract-assets');

router.get('/', (req, res, next) => {

  const assets = extractAssets(res, 'face-comparison', 'vendors~face-comparison');
  res.render('face-comparison', assets);
});

module.exports = router;
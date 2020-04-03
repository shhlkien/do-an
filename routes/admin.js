const router = require('express').Router();

const extractAssets = require('../helpers/extract-assets');

router
  .get('/', (req, res, next) => {

    const assets = extractAssets(res, 'admin');

    res.render('admin', { ...assets });
  })

module.exports = router;
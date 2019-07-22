const router = require('express').Router();
const extractAssets = require('../helpers/extract-assets');

router.get('/', (req, res, next) => {

    const assets = extractAssets(res, 'index');
    // res.sendStatus(200)
    res.render('index', assets);
});

module.exports = router;
const router = require('express').Router();

const { Class } = require('../models/classes');
const extractAssets = require('../helpers/extract-assets');

router
  .get('/', async (req, res, next) => {

    try {
      const classes = await Class
        .find({ lecturer: req.session.userId }, 'name subject')
        .lean();
      const assets = extractAssets(res, 'home');

      res.render('home', { ...assets, classes });
    }
    catch (error) { next(error); }
  });

module.exports = router;
const router = require('express').Router();

const extractAssets = require('../helpers/extract-assets');
const { Student } = require('../models/students');

router
  .get('/', (req, res, next) => {

    const assets = extractAssets(res, 'admin');

    res.render('admin', { ...assets, isAdmin: true });
  })
  .get('/models', async (req, res, next) => {

    const assets = extractAssets(res, 'models', 'vendors~models');

    try {
      const students = await Student.find({}, 'id name images').lean();

      res.render('models', { ...assets, isAdmin: true, students });
    }
    catch (error) { next(error); }
  });

module.exports = router;
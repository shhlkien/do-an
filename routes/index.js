const router = require('express').Router();

const models = require('./models');
const faceComparison = require('./face-comparison');

router
  .use('/models', models)
  .use('/', faceComparison);

module.exports = router;
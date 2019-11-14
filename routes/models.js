const fs = require('fs');
const multer = require('multer');
const os = require('os');
const path = require('path');
const router = require('express').Router();

const extractAssets = require('../helpers/extract-assets');
const { isEmpty, allowedFile } = require('../helpers/validation');
const { Faces, Person } = require('../models/faces');

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve('uploads'),
    filename: function(req, file, cb) { cb(null, file.originalname); }
  })
});

router
  .get('/fetch', async (req, res, next) => {

    let { name, skip, type, limit = 5 } = req.query;

    limit = parseInt(limit);
    skip = parseInt(skip) * limit;

    switch (type) {
      case 'models':
        try {
          const result = await Faces.find({ name: name }).select('-_id models').slice('models', [skip, limit]);
          res.status(200).json(result[0]['models']);
        }
        catch (err) {
          console.error(err);
          res.sendStatus(500);
        }
        break;
      case 'name':
      default:
        try {
          const people = await Person.find().select('-_id name').skip(skip).limit(limit);
          res.status(200).json(people);
        }
        catch (err) {
          console.error(err);
          res.sendStatus(500);
        }
        break;
    }
  })
  .get('/', (req, res, next) => {

    const assets = extractAssets(res, 'models');
    res.render('models', assets);
  })
  .post('/upload', upload.fields([
    { name: 'name', maxCount: 1 },
    { name: 'models', maxCount: 5 },
  ]), (req, res, next) => {

    let hasError = false;

    if (isEmpty(req.body.name)) hasError = true;

    if (!req.files.models) hasError = true;
    else
      for (const file of req.files.models) {
        if (!allowedFile(file.filename) || !file.mimetype.match(/image\/(png|jpeg)/)) {

          fs.unlink(file.path, (err) => { console.error(err) });
          hasError = true;
        }
      }

    if (hasError) return res.sendStatus(400);

    const models = [];

    for (const file of req.files.models) {

      const delimiter = os.platform() === 'win32' ? '\\' : '/';
      const newPath = [file.destination, req.body.name, file.filename].join(delimiter);

      if (fs.existsSync(file.path)) {

        fs.mkdir(path.resolve('uploads', req.body.name), { mode: 766 }, (err) => {

          if (err && err.code !== 'EEXIST') throw err;

          fs.rename(file.path, newPath, async (err) => {

            if (err) throw err;

            models.push([req.body.name, file.filename].join(delimiter));

            if (models.length === req.files.models.length) {

              try {
                await Person.updateOne({ name: req.body.name }, {}, { upsert: 1 });
                const result = await Faces.updateOne({ name: req.body.name }, { $push: { models } }, { upsert: 1 });

                if (result.ok) res.sendStatus(201);
                else res.sendStatus(400);
              }
              catch (err) {
                console.error(err);
                res.sendStatus(500);
              }
            }
          });
        });
      }
    }
  });

module.exports = router;
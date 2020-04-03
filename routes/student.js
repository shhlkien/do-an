const { platform } = require('os');
const { readFile, utils } = require('xlsx');
const { resolve } = require('path');
const multer = require('multer');
const router = require('express').Router();

const { Student } = require('../models/students');
const { info } = require('../helpers/console');
const { exists, mkdir, rename } = require('../helpers/fs-promise');

const studentUpload = multer({
  storage: multer.diskStorage({
    filename: function(req, file, cb) { cb(null, file.originalname); }
  }),
  fileFilter: function(req, file, cb) {

    const mimetype = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    if (mimetype.includes(file.mimetype))
      cb(null, true);
    else cb(null, false);
  },
});
const modelUpload = multer({
  storage: multer.diskStorage({
    destination: resolve('uploads'),
    filename: function(req, file, cb) { cb(null, file.originalname); }
  }),
  fileFilter: function(req, file, cb) {

    const mimetype = ['image/jpeg', 'image/png'];

    if (mimetype.includes(file.mimetype))
      cb(null, true);
    else cb(null, false);
  }
});

router
  .get('/:id', (req, res, next) => {


  })
  .post('/:id', modelUpload.array('models', 5), async (req, res, next) => {

    if (!req.files) {

      const error = new Error('Invalid image');
      error.status = 400;

      next(error);
      return;
    }

    const models = [];
    const studentId = req.params.id;
    const delimiter = platform() === 'win32' ? '\\' : '/';
    const dir = resolve('uploads', studentId);

    try {
      if (!await exists(dir)) await mkdir(dir);

      for (const file of req.files) {

        if (await exists(file.path)) {

          const newPath = [dir, file.filename].join(delimiter);

          await rename(file.path, newPath);

          models.push([studentId, file.filename].join(delimiter));

          if (models.length === req.files.length) {

            const result = await Student.updateOne({ id: studentId }, { $push: { images: models } }, { upsert: 1 });

            if (result.ok) res.sendStatus(201);
            else res.sendStatus(500);
          }
        }
      }
    }
    catch (error) { next(error); }
  })
  .get('/', async (req, res, next) => {

    const limit = 30;
    const skip = (req.query.page - 1) * limit;

    try {
      const students = await Student.find().select('id name images').limit(limit).skip(skip).lean();

      res.status(200).json({ amount: students.length, students });
    }
    catch (error) { next(error); }
  })
  .post('/', studentUpload.single('studentList'), async (req, res, next) => {

    if (!req.file) {

      res.status(400).json({
        ok: false,
        error: 'Invalid file'
      });
      return;
    }

    const workbook = readFile(req.file.path);
    const students = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    try {
      await Student.insertMany(students, { lean: true });

      res.sendStatus(201);
    }
    catch (error) { next(error); }
  });

module.exports = router;
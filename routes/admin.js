const router = require('express').Router();
const multer = require('multer');
const { readFile, utils } = require('xlsx');
const bcrypt = require('bcrypt');

const extractAssets = require('../helpers/extract-assets');
const { Student } = require('../models/students');
const { Lecturer } = require('../models/lecturers');

const lectureUpload = multer({
  storage: multer.diskStorage({
    filename: function(req, file, cb) { cb(null, file.originalname); }
  }),
  fileFilter: function(req, file, cb) {

    const mimetype = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/wps-office.xlsx'];

    if (mimetype.includes(file.mimetype))
      cb(null, true);
    else cb(null, false);
  },
});

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
  })
  .post('/', lectureUpload.single('lecturerList'), async (req, res, next) => {

    if (!req.file) {

      res.status(400).json({
        ok: false,
        error: 'Invalid file'
      });
      return;
    }

    const workbook = readFile(req.file.path);
    const lecturers = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    for (let i = lecturers.length; --i >= 0;) {

      const password = bcrypt.hashSync('123456', 10);
      lecturers[i].password = password;
    }

    try {
      await Lecturer.insertMany(lecturers, { lean: true });

      res.sendStatus(201);
    }
    catch (error) { next(error); }
  });

module.exports = router;
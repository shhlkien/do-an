const router = require('express').Router();
const multer = require('multer');
const { utils, readFile } = require('xlsx');

const { Class } = require('../models/classes');
const { Lecturer } = require('../models/lecturers');
const { Student } = require('../models/students');
const { info } = require('../helpers/console');

const classUpload = multer({
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
  .post('/', classUpload.single('class'), async (req, res, next) => {

    if (!req.file) {

      res.status(400).json({
        ok: false,
        error: 'Invalid file'
      });
      return;
    }

    const workbook = readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = utils.decode_range(sheet['!ref']);
    // read first two row
    range.s.r = 0;
    range.e.r = 1;
    const data = utils.sheet_to_json(sheet, { range: utils.encode_range(range) })[0];
    // read the rest
    const studentData = utils.sheet_to_json(sheet, { range: 2, header: ['id'] });

    try {
      const lecturer = await Lecturer.findOne({ username: data.lecturer_id }, '_id');
      const students = [];

      for (let i = 1; i < studentData.length; i++) {

        const student = await Student.findOne({ id: studentData[i].id }, '_id');
        students.push(student._id);
      }

      // format and save to Mongoose document
      await Class.create({
        name: data.name,
        subject: { id: data.subject_id, name: data.subject_name },
        lecturer: lecturer._id,
        students: students
      });

      res.sendStatus(201);
    }
    catch (error) { next(error); }
  });

module.exports = router;
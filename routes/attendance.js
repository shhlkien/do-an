const { resolve } = require('path');
const { tmpdir } = require('os');
const multer = require('multer');
const router = require('express').Router();

const { Attendance } = require('../models/attendance');
const { Class } = require('../models/classes');
const { faceRecognition } = require('../face-api/face-recognition');
const { readFile } = require('../helpers/fs-promise');
const extractAssets = require('../helpers/extract-assets');

const upload = multer({
  storage: multer.diskStorage({
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
  .get('/result-image', async (req, res, next) => {

    try {
      const data = await readFile(resolve(tmpdir(), 'faceRecognition.jpg'));

      res.end(data, 'binary');
    }
    catch (err) { next(err); }
  })
  .get('/:classId', async (req, res, next) => {

    const { time, download } = req.query;
    let data = null;

    if ('true' === download) {

    }
    else if (time) {

      try {
        data = await getAttendanceDetail(req.params.classId, time);
      }
      catch (error) { next(error); }
    }
    else {
      try {
        data = await getAttendanceList(req.params.classId);
        const assets = extractAssets(res, 'attendance-detail');

        res.render('attendance-detail', { ...assets, data });
      }
      catch (error) { next(error); }
    }
  })
  .get('/:classId/today', async (req, res, next) => {

    const assets = extractAssets(res, 'attendance');
    const now = new Date(Date.now());
    const dawn = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 00:00:00`);

    try {
      const classDetail = await Class
        .findById(req.params.classId, 'name subject.name students')
        .populate('students', 'id name')
        .lean();
      const isCreated = await Attendance.countDocuments({
        date: {
          $lt: now.toISOString(),
          $gt: dawn.toISOString()
        }
      });

      if (!isCreated)
        await Attendance.create({
          _class: classDetail._id,
          students: classDetail.students
        });

      res.render('attendance', { ...assets, classDetail });
    }
    catch (error) { next(error); }
  })
  .post('/recognize', upload.single('image'), async (req, res, next) => {

    if (!req.file) {

      res.status(400).json({
        ok: false,
        error: 'Invalid file'
      });
      return;
    }

    const now = new Date(Date.now());
    const dawn = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 00:00:00`);

    try {
      const results = await faceRecognition(req.file);

      if (results) {

        const studentIds = [];

        for (let i = results.length; --i >= 0;)
          studentIds.push(results[i].id);

        await Attendance.updateOne({
          _class: req.body.classId,
          date: {
            $lt: now.toISOString(),
            $gt: dawn.toISOString()
          }
        }, {
          $set: { 'students.$[elem].isAbsent': false }
        }, {
          arrayFilters: [{ 'elem._id': { $in: studentIds } }]
        });
      }

      res.status(200).json({ results, ok: true });
    }
    catch (error) { next(error); }
  });

module.exports = router;

function getAttendanceDetail(classId, time) {

  return Attendance
    .findOne({ _class: classId, date: time })
    .populate('_class', 'name lecturer subject')
    .populate('lecturer', 'name')
    .lean();
}

function getAttendanceList(classId) {

  return Attendance
    .find({ _class: classId }, 'date _class')
    .populate('_class', 'name subject lecturer')
    .lean();
}
const { resolve, sep } = require('path');
const { tmpdir } = require('os');
const { utils, writeFile } = require('xlsx');
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
  .get('/excel', async (req, res, next) => {

    const { exp, file } = req.query;

    if (req.session.downloadExp === parseInt(exp) && Date.now() < exp)
      res.download(tmpdir + sep + file);
    else res.sendStatus(400);
  })
  .get('/:classId', async (req, res, next) => {

    const { from, to } = req.query;
    let downloadUrl = null;

    try {
      const data = await Attendance
        .find({
          _class: req.params.classId,
          date: {
            $gt: new Date(from).toISOString(),
            $lt: new Date(to).toISOString()
          }
        })
        .populate({
          path: '_class',
          select: 'name subject lecturer',
          populate: {
            path: 'lecturer',
            select: 'name'
          }
        });

      if (data.length) {

        exportToExcel(data, tmpdir + sep + data[0]._class.name + '.xlsx');

        const downloadExp = Date.now() + 30000;
        const params = new URLSearchParams({
          file: data[0]._class.name + '.xlsx',
          exp: downloadExp
        });
        req.session.downloadExp = downloadExp;
        downloadUrl = '/attendance/excel?' + params;
      }

      res.status(200).json({ ok: true, downloadUrl });
    }
    catch (err) { next(err); }
  })
  .get('/:classId/today', async (req, res, next) => {

    const assets = extractAssets(res, 'attendance');
    const now = new Date(Date.now());
    const dawn = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 00:00:00`);

    try {
      let classDetail;
      const isCreated = await Attendance.countDocuments({
        _class: req.params.classId,
        date: {
          $lt: now.toISOString(),
          $gt: dawn.toISOString()
        }
      });

      if (!isCreated) {

        classDetail = await Class
          .findById(req.params.classId, 'name subject.name students')
          .populate('students', 'id name')
          .lean();
        await Attendance.create({
          _class: classDetail._id,
          students: classDetail.students
        });
      }
      else {
        classDetail = await Attendance
          .findOne({
            _class: req.params.classId,
            date: {
              $lt: now.toISOString(),
              $gt: dawn.toISOString()
            }
          })
          .populate('_class', 'name subject.name')
          .lean();
        classDetail.name = classDetail._class.name;
        classDetail.subject = classDetail._class.subject;
        classDetail._id = classDetail._class._id;
        delete classDetail._class;
      }

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
  })
  .put('/check-by-hand', async (req, res, next) => {

    const now = new Date(Date.now());
    const dawn = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 00:00:00`);

    try {
      await Attendance.updateOne({
        _class: req.body.classId,
        'students._id': req.body.studentId,
        date: {
          $lt: now.toISOString(),
          $gt: dawn.toISOString()
        }
      }, {
        $set: { 'students.$.isAbsent': req.body.isAbsent }
      });

      res.status(200).json({ ok: true });
    }
    catch (error) { next(error); }
  });

module.exports = router;

function exportToExcel(data, filename) {

  const dataToWrite = [
    [`Mã học phần: ${data[0]._class.subject.id}`],
    [`Tên học phần: ${data[0]._class.subject.name}`],
    [`Lớp: ${ data[0]._class.name}`],
    [`Giảng viên: ${data[0]._class.lecturer.name}`],
    [],
  ];
  const students = data[0].students;
  const exportedStudents = [];

  for (let i = 0; i < students.length; i++) {

    const student = students[i];
    const exportedInfo = {
      'Mã sinh viên': student.id,
      'Họ tên': student.name,
    };

    for (const info of data) {

      const date = `${info.date.getDate()}/${info.date.getMonth() + 1}/${info.date.getFullYear()}`;
      const thisStudent = info.students.find(_student => _student.id === student.id);

      if (thisStudent)
        exportedInfo[date] = thisStudent.isAbsent ? '' : 'x';
    }

    exportedStudents[i] = exportedInfo;
  }

  const workbook = utils.book_new();
  const worksheet = utils.aoa_to_sheet(dataToWrite);
  const range = utils.decode_range(worksheet['!ref']);

  utils.sheet_add_json(worksheet, exportedStudents, { origin: range.e.r + 2 });
  utils.book_append_sheet(workbook, worksheet);
  writeFile(workbook, filename);
}
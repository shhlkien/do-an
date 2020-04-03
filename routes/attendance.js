const router = require('express').Router();

const { Class } = require('../models/classes');
const { Attendance } = require('../models/attendance');
const extractAssets = require('../helpers/extract-assets');

router
  .get('/:classId', async (req, res, next) => {

    const { time, download } = req.query;
    let data = null;

    if ('true' === download) {

    }
    else if (time) {

      try {
        data = getAttendanceDetail(req.params.classId, time);
      }
      catch (error) { next(error); }
    }
    else {
      try {
        const list = await getAttendanceList(req.params.classId);
        data = { amount: list.length, list };
      }
      catch (error) { next(error); }
    }

    res.status(200).json(data);
  })
  .get('/:classId/today', async (req, res, next) => {

    try {
      const classDetail = await Class
        .findById(req.params.classId, 'name subject.name students')
        .populate('students', 'id name')
        .lean();
      const assets = extractAssets(res, 'attendance', 'vendors~attendance');

      res.render('attendance', { ...assets, classDetail });
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

  return Class
    .find({ _class: classId }, 'date _class')
    .populate('_class', 'name subject lecturer')
    .lean();
}
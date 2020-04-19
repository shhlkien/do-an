const router = require('express').Router();

const { error } = require('../helpers/console');
const auth = require('./auth');
const student = require('./student');
const classes = require('./classes');
const home = require('./home');
const attendance = require('./attendance');
const admin = require('./admin');

const ERRORS = ['EEXIST'];

/**
 * / => home: name lecturer's classes
 * /auth => login and logout
 * /attendance/{classId} => name attendance list
 * /attendance/{classId}?time=xxx => get attendance detail at time
 * /attendance/{classId}?time=xxx&&download=true => download attendance at time
 * /attendance/{classId}/today => show attendance view
 * [post] /attendance/{classId}/today => do attendance
 * [post] /class => import class from excel
 * /student => get student list
 * [post] /student => import student list from excel
 * /student/{studentId} => upload student's models view
 * [post] /student/{studentId} => upload student's models
 */
router
  .use('/auth', auth)
  .use('/admin', checkLogin, admin)
  .use('/student', checkLogin, student)
  .use('/class', classes)
  .use('/attendance', attendance)
  // .use('/models', models)
  .use('/', checkLogin, home)
  .use((err, req, res, next) => {

    console.log(error(`index.js:30: `), err);

    if (res.headersSent) return;

    res.status(err.status || 500).json({
      ok: false,
      error: ERRORS.includes(err.code) ? 'Internal server error' : err.message
    });
  });

module.exports = router;

function checkLogin(req, res, next) {

  if (!req.session.loggedIn)
    res.redirect('/auth');
  else next();
}
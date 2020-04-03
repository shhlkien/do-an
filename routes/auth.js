const router = require('express').Router();
const bcrypt = require('bcrypt');

const extractAssets = require('../helpers/extract-assets');
const { Lecturer } = require('../models/lecturers');

router
  .get('/', (req, res, next) => {

    if (req.session.loggedIn) {

      res.redirect('/');
      return;
    }

    const assets = extractAssets(res, 'login');
    res.render('login', assets);
  })
  .post('/', async (req, res, next) => {

    const { username, password, action } = req.body;

    if ('logout' === action) {

      req.session.loggedIn = false;
      req.session.username = '';
      res.status(200).send('logged out');
      return;
    }
    else if ('login' === action && req.session.loggedIn) {

      res.redirect('/');
      return;
    }

    try {
      const lecturer = await Lecturer.findOne({ username });
      const isMatch = await bcrypt.compare(password, lecturer.password);

      if (!isMatch) {

        res.status(400).json({ message: 'Invalid account' });
        return;
      }

      req.session.loggedIn = true;
      req.session.username = username;
      req.session.userId = lecturer.id;
      res.redirect('/');
    }
    catch (error) { next(error); }
  });

module.exports = router;
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connect, connection } = require('mongoose');

const { Lecturer } = require('../models/lecturers');

connect(process.env.DB_URL, {
    useFindAndModify: false,
    useNewUrlParser: true,
  })
  .catch(console.error);

const password = bcrypt.hashSync('123456', 10);

Promise.resolve((() => {

    const lecturers = [{
      name: 'Nguyen Van A',
      username: 'nguyenvana@ictu.edu.vn',
      password: password
    }, {
      name: 'Nguyen Thi B',
      username: 'nguyenthib@ictu.edu.vn',
      password: password
    }];

    return lecturers;
  })())
  .then(users => Lecturer.insertMany(users))
  .then(res => console.log('created 2 users'))
  .catch(console.error)
  .finally(() => {

    connection.close();
    process.exit();
  });
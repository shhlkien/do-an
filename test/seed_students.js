require('dotenv').config();
const { connect, connection } = require('mongoose');
const { createHash } = require('crypto');

const { readDir } = require('../helpers/fs-promise');
const { Student } = require('../models/students');
const { Class } = require('../models/classes');

connect(process.env.DB_URL, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(console.error);


run();

async function run() {

  try {
    await Promise.all([
      Class.deleteMany(),
      Student.deleteMany()
    ]);

    const models = await readDir('test/models');
    const students = [];

    for (let i = models.length; --i >= 0;) {

      const name = models[i].name.includes('actor') ?
        models[i].name.substring(0, models[i].name.indexOf('actor')).trim() :
        models[i].name.trim();
      const id = createHash('md5').update(name).digest('hex').substring(0, 12);

      students.push({ id, name });
    }

    const docs = await Student.insertMany(students);

    await Class.create({
      name: 'Test class',
      subject: { id: 'jfwioefjo', name: 'subject_name' },
      lecturer: '5e874b3fb74e6d57ffeace00',
      students: docs.map(student => student._id)
    });

    console.info(`seed_students.js:35: `, docs.length);
  }
  catch (err) {
    console.error(err);
  }
  finally {
    connection.close();
    process.exit();
  }
}
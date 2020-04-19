require('dotenv').config();
const { connect, connection } = require('mongoose');
const faceapi = require('face-api.js');
const { join } = require('path');

const { error, info } = require('../helpers/console');
const { Student } = require('../models/students');
const { Face } = require('../models/faces');
const loadImage = require('./env');

connect(process.env.DB_URL, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(console.error);

run();

async function run() {

  const limit = 20;
  const trainedDataDir = join(__dirname, './weights');

  try {
    await Promise.all([
      faceapi.nets.faceLandmark68Net.loadFromDisk(trainedDataDir),
      faceapi.nets.faceRecognitionNet.loadFromDisk(trainedDataDir),
      faceapi.nets.ssdMobilenetv1.loadFromDisk(trainedDataDir),
    ]);

    await Face.deleteMany();

    const noOfStudents = await Student.countDocuments();

    for (let skip = 0; skip < noOfStudents; skip += limit) {

      const students = await Student.find().select('name images').limit(limit).skip(skip).lean();
      const faceMatcher = await createFaceMatcher(students);

      await Face.create({ faceMatcher: faceMatcher.toJSON() });
    }

    console.log(info(`training.js: done`));
  }
  catch (err) { console.log(error('training.js'), err); }
  finally {
    connection.close();
    process.exit();
  }
}

async function createFaceMatcher(studentList) {

  try {
    const labeledFaceDescriptors = await Promise.all(studentList.map(
      async student => {

        const descriptors = [];
        const models = student.images;

        for (let i = models.length; --i >= 0;) {

          const img = await loadImage(join(__dirname, `../uploads/${models[i]}`));

          descriptors.push(await faceapi.computeFaceDescriptor(img));
        }

        return new faceapi.LabeledFaceDescriptors(JSON.stringify({
          id: student._id,
          name: student.name
        }), descriptors);
      }
    ));

    return new faceapi.FaceMatcher(labeledFaceDescriptors);
  }
  catch (err) { console.log(error(err)); }
}
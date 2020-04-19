const { join, resolve } = require('path');
const { tmpdir } = require('os');
const faceapi = require('face-api.js');
const sizeOf = require('image-size');

const { error, info } = require('../helpers/console');
const { Face } = require('../models/faces');
const { faceDetectorOptions, faceDetectionNet } = require('./face-detection-options');
const { writeFile } = require('../helpers/fs-promise');
const loadImage = require('./env');

async function getResults(input, faceMatcher) {

  try {
    const image = await loadImage(input.path);
    const results = await faceapi.detectAllFaces(image, faceDetectorOptions).withFaceLandmarks().withFaceDescriptors();

    if (0 === results.length) return null;

    const dims = sizeOf(input.path);
    const resizedResults = faceapi.resizeResults(results, dims);
    const output = faceapi.createCanvasFromMedia(image);
    const matchedResults = [];

    for (let i = resizedResults.length; --i >= 0;) {

      const { detection, descriptor } = resizedResults[i];
      let label = faceMatcher.findBestMatch(descriptor).toString();

      if (label.includes('unknown')) continue;

      label = JSON.parse(label.replace(/\s\(.+\)/, ''));
      const drawBox = new faceapi.draw.DrawBox(detection.box, {
        boxColor: '#ffed8ab8',
        drawLabelOptions: { fontColor: '#000', padding: 8 },
        label: label.name,
      });

      drawBox.draw(output);
      matchedResults.push(label);
    }

    if (matchedResults.length > 0) {

      await writeFile(resolve(tmpdir(), 'faceRecognition.jpg'), output.toBuffer('image/jpeg'));
      return matchedResults;
    }

    return null;
  }
  catch (err) { console.log(error('face-recognition.js: 48 ', err)) }
}

exports.faceRecognition = async function(image) {

  const trainedDataDir = join(__dirname, './weights');

  try {
    if (!faceDetectionNet.params) {

      await Promise.all([
        faceapi.nets.faceLandmark68Net.loadFromDisk(trainedDataDir),
        faceapi.nets.faceRecognitionNet.loadFromDisk(trainedDataDir),
        faceDetectionNet.loadFromDisk(trainedDataDir),
      ]);
    }

    const noOfFaceMatchers = await Face.estimatedDocumentCount();

    for (let i = 0; i < noOfFaceMatchers; i++) {

      const face = await Face.find().select('faceMatcher -_id').limit(1).skip(i).lean();
      const faceMatcher = faceapi.FaceMatcher.fromJSON(face[0].faceMatcher);
      const results = await getResults(image, faceMatcher);

      if (results) return results;
    }

    return null;
  }
  catch (err) { console.log(error('face-recognition.js: 78 ', err)); }
}
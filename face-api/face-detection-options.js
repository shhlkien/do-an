const faceapi = require('face-api.js');

const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
// const faceDetectionNet = faceapi.nets.tinyFaceDetector;
//  const faceDetectionNet = faceapi.nets.mtcnn;

// SsdMobilenetv1Options
const minConfidence = 0.5;

// TinyFaceDetectorOptions
const inputSize = 480;
const scoreThreshold = 0.5;

// MtcnnOptions
const minFaceSize = 50;
const scaleFactor = 0.8;

const getFaceDetectorOptions = (neuralNetwork) => {

  switch (neuralNetwork) {
    case faceapi.nets.ssdMobilenetv1:
      return new faceapi.SsdMobilenetv1Options({ minConfidence });
    case faceapi.nets.tinyFaceDetector:
      return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
    case faceapi.nets.mtcnn:
      return new faceapi.MtcnnOptions({ minFaceSize, scaleFactor });
  }
}

exports.faceDetectorOptions = getFaceDetectorOptions(faceDetectionNet);
exports.faceDetectionNet = faceDetectionNet;
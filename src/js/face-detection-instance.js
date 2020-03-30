import * as faceapi from 'face-api.js';

const SSD_MOBILENETV1 = 'ssd_mobilenetv1';
const TINY_FACE_DETECTOR = 'tiny_face_detector';
const MTCNN = 'mtcnn';
export let faceDetector = TINY_FACE_DETECTOR;

export function isFaceDetectionModelLoaded() { return !!getCurrentFaceDetectionNet().params }

export function getCurrentFaceDetectionNet() {

  switch (faceDetector) {
    case SSD_MOBILENETV1:
      return faceapi.nets.ssdMobilenetv1;
    case TINY_FACE_DETECTOR:
      return faceapi.nets.tinyFaceDetector;
    case MTCNN:
      return faceapi.nets.mtcnn;
  }
}

export function getFaceDetectorOptions() {

  switch (faceDetector) {
    case SSD_MOBILENETV1:
      return new faceapi.SsdMobilenetv1Options({ minConfidence: .5 });
    case TINY_FACE_DETECTOR:
      return new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0 });
    case MTCNN:
      return new faceapi.MtcnnOptions({ minFaceSize: 20 });
  }
}
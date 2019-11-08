import '../images/favicon.ico';
import '../scss/test/face-comparison.scss';

import { getCurrentFaceDetectionNet, getFaceDetectorOptions, isFaceDetectionModelLoaded, faceDetector } from './face-detection-instance';

let faceMatcher = null;

window.addEventListener('load', async () => {

  await faceapi.loadFaceLandmarkModel('/assets/weights');
  await faceapi.loadFaceRecognitionModel('/assets/weights');
  faceMatcher = await createBbtFaceMatcher(3);
  updateResults();
}, false);

async function updateResults() {

  if (!isFaceDetectionModelLoaded())
    await getCurrentFaceDetectionNet().load('/assets/weights');

  const inputImg = document.getElementById('inputImg');
  const overlay = document.getElementById('overlay');
  const results = await faceapi.detectAllFaces(inputImg, getFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
  const resizedResults = faceapi.resizeResults(results, inputImg);

  faceapi.matchDimensions(overlay, inputImg);
  resizedResults.forEach(({ detection, descriptor }) => {

    const label = faceMatcher.findBestMatch(descriptor).toString();
    const drawBox = new faceapi.draw.DrawBox(detection.box, { label });
    drawBox.draw(overlay);
  });
}

async function createBbtFaceMatcher(numImagesForTraining = 1) {

  const classes = ['benedict_cumberbatch', 'robert_jr'];
  const maxAvailableImagesPerClass = 5;
  numImagesForTraining = Math.min(numImagesForTraining, maxAvailableImagesPerClass);
  const imgSrc = {
    'amy': [imgSrc1, imgSrc2, imgSrc3, imgSrc4, imgSrc5],
    'benedict_cumberbatch': [imgSrc6, imgSrc7, imgSrc8, imgSrc9, imgSrc10],
    'bernadette': [imgSrc11, imgSrc12, imgSrc13, imgSrc14, imgSrc15],
    'howard': [imgSrc16, imgSrc17, imgSrc18, imgSrc19, imgSrc20],
    'leonard': [imgSrc21, imgSrc22, imgSrc23, imgSrc24, imgSrc25],
    'penny': [imgSrc26, imgSrc27, imgSrc28, imgSrc29, imgSrc30],
    'raj': [imgSrc31, imgSrc32, imgSrc33, imgSrc34, imgSrc35],
    'sheldon': [imgSrc36, imgSrc37, imgSrc38, imgSrc39, imgSrc40],
    'stuart': [imgSrc41, imgSrc42, imgSrc43, imgSrc44, imgSrc45]
  };

  const labeledFaceDescriptors = await Promise.all(classes.map(
    async className => {

      const descriptors = [];

      for (let i = numImagesForTraining + 1; --i >= 0;) {

        const img = await faceapi.fetchImage(`/model-images/${className}`);
        descriptors.push(await faceapi.computeFaceDescriptor(img));
      }

      return new faceapi.LabeledFaceDescriptors(className, descriptors);
    }
  ));

  return new faceapi.FaceMatcher(labeledFaceDescriptors);
}
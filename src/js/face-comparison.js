import '../images/favicon.ico';
import imgSrc1 from '../models/images/amy/amy_1.png';
import imgSrc2 from '../models/images/amy/amy_2.png';
import imgSrc3 from '../models/images/amy/amy_3.png';
import imgSrc4 from '../models/images/amy/amy_4.png';
import imgSrc5 from '../models/images/amy/amy_5.png';
import imgSrc6 from '../models/images/benedict_cumberbatch/benedict_cumberbatch_1.png';
import imgSrc7 from '../models/images/benedict_cumberbatch/benedict_cumberbatch_2.png';
import imgSrc8 from '../models/images/benedict_cumberbatch/benedict_cumberbatch_3.png';
import imgSrc9 from '../models/images/benedict_cumberbatch/benedict_cumberbatch_4.png';
import imgSrc10 from '../models/images/benedict_cumberbatch/benedict_cumberbatch_5.png';
import imgSrc11 from '../models/images/bernadette/bernadette_1.png';
import imgSrc12 from '../models/images/bernadette/bernadette_2.png';
import imgSrc13 from '../models/images/bernadette/bernadette_3.png';
import imgSrc14 from '../models/images/bernadette/bernadette_4.png';
import imgSrc15 from '../models/images/bernadette/bernadette_5.png';
import imgSrc16 from '../models/images/howard/howard_1.png';
import imgSrc17 from '../models/images/howard/howard_2.png';
import imgSrc18 from '../models/images/howard/howard_3.png';
import imgSrc19 from '../models/images/howard/howard_4.png';
import imgSrc20 from '../models/images/howard/howard_5.png';
import imgSrc21 from '../models/images/leonard/leonard_1.png';
import imgSrc22 from '../models/images/leonard/leonard_2.png';
import imgSrc23 from '../models/images/leonard/leonard_3.png';
import imgSrc24 from '../models/images/leonard/leonard_4.png';
import imgSrc25 from '../models/images/leonard/leonard_5.png';
import imgSrc26 from '../models/images/penny/penny_1.png';
import imgSrc27 from '../models/images/penny/penny_2.png';
import imgSrc28 from '../models/images/penny/penny_3.png';
import imgSrc29 from '../models/images/penny/penny_4.png';
import imgSrc30 from '../models/images/penny/penny_5.png';
import imgSrc31 from '../models/images/raj/raj_1.png';
import imgSrc32 from '../models/images/raj/raj_2.png';
import imgSrc33 from '../models/images/raj/raj_3.png';
import imgSrc34 from '../models/images/raj/raj_4.png';
import imgSrc35 from '../models/images/raj/raj_5.png';
import imgSrc36 from '../models/images/sheldon/sheldon_1.png';
import imgSrc37 from '../models/images/sheldon/sheldon_2.png';
import imgSrc38 from '../models/images/sheldon/sheldon_3.png';
import imgSrc39 from '../models/images/sheldon/sheldon_4.png';
import imgSrc40 from '../models/images/sheldon/sheldon_5.png';
import imgSrc41 from '../models/images/stuart/stuart_1.png';
import imgSrc42 from '../models/images/stuart/stuart_2.png';
import imgSrc43 from '../models/images/stuart/stuart_3.png';
import imgSrc44 from '../models/images/stuart/stuart_4.png';
import imgSrc45 from '../models/images/stuart/stuart_5.png';
import test1 from '../images/benedict_cumberbatch_6.png';
import test2 from '../images/benedict_cumberbatch_7.png';
import test3 from '../images/benedict_cumberbatch_5.png';
import '../scss/test/face-comparison.scss';

import { getCurrentFaceDetectionNet, getFaceDetectorOptions, isFaceDetectionModelLoaded, faceDetector } from './face-detection-instance';

let faceMatcher = null;

window.addEventListener('load', async () => {

  document.getElementById('inputImg1').src = test3;

  await faceapi.loadFaceLandmarkModel('/assets/weights');
  await faceapi.loadFaceRecognitionModel('/assets/weights');
  faceMatcher = await createBbtFaceMatcher(3);
  updateResults();
}, false);

async function updateResults() {

  if (!isFaceDetectionModelLoaded())
    await getCurrentFaceDetectionNet().load('/assets/weights');

  const inputImg = document.getElementById('inputImg1');
  const overlay = document.getElementById('overlay1');
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

  const classes = ['amy', 'benedict_cumberbatch', 'bernadette', 'howard', 'leonard', 'penny', 'raj', 'sheldon', 'stuart'];
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

        console.info(imgSrc[className][i])
        const img = await faceapi.fetchImage(imgSrc[className][i]);
        descriptors.push(await faceapi.computeFaceDescriptor(img));
      }

      return new faceapi.LabeledFaceDescriptors(className, descriptors);
    }
  ));

  return new faceapi.FaceMatcher(labeledFaceDescriptors);
}
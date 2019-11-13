import '../images/favicon.ico';
import '../scss/test/face-comparison.scss';

import { getCurrentFaceDetectionNet, getFaceDetectorOptions, isFaceDetectionModelLoaded } from './face-detection-instance';
import { createElement, waitUntilElementExists } from './dom';

let faceMatcher = null;
let skip = 0;
const camTemplate = previewCamTemplate();
const imgTemplate = previewImgTemplate();
const openCamera = document.getElementById('openCamera');
const inputFile = document.querySelector('.file-input');

window.addEventListener('load', async () => {

  try {
    await faceapi.loadFaceLandmarkModel('/assets/weights');
    await faceapi.loadFaceRecognitionModel('/assets/weights');
  }
  catch (err) { console.error(err) }

  openCamera.addEventListener('click', streamWebcam, false);

  inputFile.addEventListener('change', streamImage, false);

}, false);

function streamImage() {

  stopWebcam(document.getElementById('camera'));

  const file = this.files[0];
  const pseudoBtn = this.nextElementSibling;

  if (file && file.type.match('image.*')) {

    const fr = new FileReader();

    if ('false' === this.getAttribute('data-in-use')) {

      const container = document.querySelector('.container');
      const row = createElement('div', { class: 'columns is-centered' });

      row.innerHTML = imgTemplate;
      container.innerHTML = ''; // reset if camera has loaded before
      container.appendChild(row);

      this.setAttribute('data-in-use', true);
      openCamera.setAttribute('data-in-use', false);
    }

    fr.addEventListener('load', async function() {

      const inputImg = await waitUntilElementExists('inputImg');

      inputImg.src = this.result;
      skip = 0;
      inputFile.setAttribute('disabled', '');
      pseudoBtn.setAttribute('disabled', '');

      await identify();

      inputFile.removeAttribute('disabled');
      pseudoBtn.removeAttribute('disabled');
    }, false);

    fr.readAsDataURL(file);
  }
}

function streamWebcam() {

  skip = 0;

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(async (stream) => {

      if ('false' === this.getAttribute('data-in-use')) {

        const container = document.querySelector('.container');
        container.innerHTML = ''; // reset if image has loaded before
        container.innerHTML = camTemplate;
        this.setAttribute('data-in-use', true);
        inputFile.setAttribute('data-in-use', false);
      }

      const camera = document.getElementById('camera');
      const takeAShot = document.getElementById('takeAShot');
      const stopCamera = document.getElementById('stopCamera');
      const inputImg = document.getElementById('inputImg');

      camera.srcObject = stream;
      camera.addEventListener('loadmetadata', () => { camera.play() }, false);

      stopCamera.addEventListener('click', () => { stopWebcam(camera) }, { once: true });

      takeAShot.addEventListener('click', async function() {

        this.setAttribute('disabled', '');

        capture(camera, inputImg);
        await identify();

        this.removeAttribute('disabled');
      }, false);
    })
    .catch(console.error);
}

function stopWebcam(camera) {

  if (null !== camera && null !== camera.srcObject) {
    camera.pause();
    camera.srcObject.getVideoTracks()[0].stop();
    camera.srcObject = null;
  }
}

function capture(camera, output) {

  const cameraCaptured = document.createElement('canvas');
  const context = cameraCaptured.getContext('2d');

  cameraCaptured.width = camera.offsetWidth;
  cameraCaptured.height = camera.offsetHeight;
  // flip the image
  context.translate(camera.offsetWidth, 0);
  context.scale(-1, 1);
  context.drawImage(camera, 0, 0, camera.offsetWidth, camera.offsetHeight);
  cameraCaptured.toBlob((blob) => {

    const url = URL.createObjectURL(blob);
    output.src = url;
    output.addEventListener('load', () => { URL.revokeObjectURL(url) }, false);
  }, 'image/jpeg', .99);
}

async function identify() {

  const loading = document.querySelector('.loading');

  loading.classList.remove('is-hidden');
  try {
    faceMatcher = await createBbtFaceMatcher(3) || faceMatcher;
    await updateResults();
    skip++;
    loading.classList.add('is-hidden');
  }
  catch (err) { console.error(err) }
}

async function updateResults() {

  const inputImg = document.getElementById('inputImg');
  const overlay = document.getElementById('overlay');

  try {
    if (!isFaceDetectionModelLoaded())
      await getCurrentFaceDetectionNet().load('/assets/weights');

    const results = await faceapi.detectAllFaces(inputImg, getFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
    const resizedResults = faceapi.resizeResults(results, inputImg);

    faceapi.matchDimensions(overlay, inputImg);
    resizedResults.forEach(({ detection, descriptor }) => {

      const label = faceMatcher.findBestMatch(descriptor).toString();
      const drawBox = new faceapi.draw.DrawBox(detection.box, {
        boxColor: '#ffed8ab8',
        drawLabelOptions: { fontColor: '#000', padding: 8 },
        label: label.replace(/\s\(.+\)/, ''),
      });
      drawBox.draw(overlay);
    });
  }
  catch (err) { console.error(err); }
}

async function createBbtFaceMatcher(numImagesForTraining = 1) {

  try {
    numImagesForTraining = Math.min(numImagesForTraining, 5);

    let params = new URLSearchParams({ skip: skip, type: 'name', }).toString();
    const people = await fetch('/models/fetch?' + params).then(res => res.json());

    if (people.length === 0) return null;

    const labeledFaceDescriptors = await Promise.all(people.map(
      async person => {

        const descriptors = [];
        params = new URLSearchParams({
          limit: numImagesForTraining,
          name: person.name,
          skip: skip,
          type: 'models',
        }).toString();
        const models = await fetch('/models/fetch?' + params).then(res => res.json());

        for (let i = models.length; --i >= 0;) {

          const img = await faceapi.fetchImage(`model-images/${models[i]}`);
          descriptors.push(await faceapi.computeFaceDescriptor(img));
        }

        return new faceapi.LabeledFaceDescriptors(person.name, descriptors);
      }
    ));

    return new faceapi.FaceMatcher(labeledFaceDescriptors);
  }
  catch (err) {
    console.error(err);
  }
}

function previewImgTemplate() {

  const columnDiv = createElement('div', { class: 'column is-narrow' });
  const boxDiv = createElement('div', { class: 'box' });
  const fig = createElement('figure', { class: 'image is-relative' });
  const canvas = createElement('canvas', { id: 'overlay' });
  const img = createElement('img', { id: 'inputImg' });
  const loadingDiv = createElement('div', { class: 'loading is-hidden' });
  const childDiv = createElement('div', { class: 'is-relative has-text-centered has-text-black' });
  const spanIcon = createElement('span', { class: 'icon is-size-1' });
  const i = createElement('i', { class: 'icon-loading animate-spin' });
  const p = createElement('p', { class: 'is-size-5' });

  p.innerText = 'Identifying...';
  spanIcon.appendChild(i);
  childDiv.appendChild(spanIcon);
  childDiv.appendChild(p);
  loadingDiv.appendChild(childDiv);

  fig.appendChild(img);
  fig.appendChild(canvas);
  fig.appendChild(loadingDiv);

  boxDiv.appendChild(fig);
  columnDiv.appendChild(boxDiv);

  return columnDiv.outerHTML;
}

function previewCamTemplate() {

  const row1 = createElement('div', { class: 'columns' });
  const row2 = createElement('div', { class: 'columns is-centered' });
  const columnRow1 = createElement('div', { class: 'column is-offset-2' });
  const buttons = createElement('div', { class: 'buttons' });
  const btnStopCam = createElement('button', { class: 'button is-outlined is-info', type: 'button', id: 'stopCamera' });
  const btnTakePhoto = createElement('button', { class: 'button is-outlined is-info', type: 'button', id: 'takeAShot' });
  const columnVideo = createElement('div', { class: 'column is-5' });
  const boxVideo = createElement('div', { class: 'box' });
  const video = createElement('video', { id: 'camera', autoplay: 'autoplay' });
  const columnImg = previewImgTemplate();

  btnStopCam.innerText = 'Stop camera';
  btnTakePhoto.innerText = 'Smile :)';
  buttons.appendChild(btnStopCam);
  buttons.appendChild(btnTakePhoto);
  columnRow1.appendChild(buttons);
  row1.appendChild(columnRow1);

  boxVideo.appendChild(video);
  columnVideo.appendChild(boxVideo);
  row2.appendChild(columnVideo);
  row2.insertAdjacentHTML('beforeend', columnImg);

  return row1.outerHTML + row2.outerHTML;
}
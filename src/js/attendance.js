import '../images/favicon.ico';
import '../scss/test/attendance.scss';

import { createElement, waitUntilElementExists } from './dom';

const camTemplate = previewCamTemplate();
const liveCamTemplate = previewLiveCamTemplate();
const imgTemplate = previewImgTemplate();
const iconOk = `<span class='icon has-text-info'><i class='icon-ok'></i></span>`;
const openCamera = document.getElementById('openCamera');
const inputFile = document.querySelector('.file-input');
const liveDetection = document.getElementById('liveDetection');
const iconChecks = document.querySelectorAll('table .icon');

window.addEventListener('load', () => {

  openCamera.addEventListener('click', streamWebcam, false);
  inputFile.addEventListener('change', streamImage, false);
  liveDetection.addEventListener('click', liveStream, false);
  iconChecks.forEach(icon => { icon.addEventListener('click', checkByHand, false); });
}, false);

function liveStream() {

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {

      if ('false' === this.getAttribute('data-in-use')) {

        const container = document.getElementById('detectionContainer');
        container.innerHTML = ''; // reset if image has loaded before
        container.innerHTML = liveCamTemplate;

        this.setAttribute('data-in-use', true);
        inputFile.setAttribute('data-in-use', false);
        openCamera.setAttribute('data-in-use', false);
      }

      const camera = document.getElementById('camera');
      const stopCamera = document.getElementById('stopCamera');

      camera.srcObject = stream;
      camera.addEventListener('loadedmetadata', onPlay, false);

      stopCamera.addEventListener('click', () => { stopWebcam(camera) }, { once: true });
    })
    .catch(console.error);
}

function streamImage() {

  stopWebcam(document.getElementById('camera'));

  const file = this.files[0];
  const pseudoBtn = this.nextElementSibling;

  if (file && file.type.match('image.*')) {

    const fr = new FileReader();

    if ('false' === this.getAttribute('data-in-use')) {

      const container = document.getElementById('detectionContainer');
      const row = createElement('div', { class: 'columns is-centered' });

      row.innerHTML = imgTemplate;
      container.innerHTML = ''; // reset if camera has loaded before
      container.appendChild(row);

      this.setAttribute('data-in-use', true);
      openCamera.setAttribute('data-in-use', false);
      liveDetection.setAttribute('data-in-use', false);
    }

    fr.addEventListener('load', async function() {

      const inputImg = await waitUntilElementExists('inputImg');

      inputImg.src = this.result;
      inputFile.setAttribute('disabled', '');
      pseudoBtn.setAttribute('disabled', '');

      await identify(inputImg);

      inputFile.removeAttribute('disabled');
      pseudoBtn.removeAttribute('disabled');
    }, false);

    fr.readAsDataURL(file);
  }
}

function streamWebcam() {

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {

      if ('false' === this.getAttribute('data-in-use')) {

        const container = document.getElementById('detectionContainer');
        container.innerHTML = ''; // reset if image has loaded before
        container.innerHTML = camTemplate;
        this.setAttribute('data-in-use', true);
        inputFile.setAttribute('data-in-use', false);
        liveDetection.setAttribute('data-in-use', false);
      }

      const camera = document.getElementById('camera');
      const takeAShot = document.getElementById('takeAShot');
      const stopCamera = document.getElementById('stopCamera');
      const inputImg = document.getElementById('inputImg');

      camera.srcObject = stream;
      camera.addEventListener('loadedmetadata', () => { camera.play() }, false);

      stopCamera.addEventListener('click', () => { stopWebcam(camera) }, { once: true });

      takeAShot.addEventListener('click', async function() {

        this.setAttribute('disabled', '');

        capture(camera, inputImg);
        await identify(inputImg);

        this.removeAttribute('disabled');
      }, false);
    })
    .catch(console.error);
}

function onPlay(e) {

  const overlay = document.getElementById('overlay');

  if (undefined === e.target || e.target.paused || e.target.ended)
    return setTimeout(() => onPlay(e));

  e.target.play();
  overlay.width = e.target.clientWidth;
  overlay.height = e.target.clientHeight;
  e.target.width = e.target.clientWidth;
  e.target.height = e.target.clientHeight;

  Promise.resolve(identify(e.target));

  setTimeout(() => onPlay(e));
}

function stopWebcam(camera) {

  if (null !== camera && null !== camera.srcObject) {
    camera.pause();
    camera.srcObject.getVideoTracks()[0].stop();
    camera.srcObject = null;
  }
}

function capture(camera, output) {

  const captureFrame = document.createElement('canvas');
  const context = captureFrame.getContext('2d');

  captureFrame.width = camera.offsetWidth;
  captureFrame.height = camera.offsetHeight;
  // flip the image
  context.translate(camera.offsetWidth, 0);
  context.scale(-1, 1);
  context.drawImage(camera, 0, 0, camera.offsetWidth, camera.offsetHeight);
  captureFrame.toBlob((blob) => {

    const url = URL.createObjectURL(blob);
    output.src = url;
    output.addEventListener('load', () => { URL.revokeObjectURL(url) }, false);
  }, 'image/jpeg', .99);
}

async function identify(input) {

  let loading = null;
  let results = null;

  if (input instanceof HTMLImageElement) {

    loading = document.querySelector('.loading');
    loading.classList.remove('is-hidden');
  }

  const formData = new FormData();

  formData.append('image', inputFile.files[0]);
  formData.append('classId', document.getElementById('classId').value);

  try {
    const res = await fetch('/attendance/recognize', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json());

    if (res.ok) {

      results = res.results;

      if (results) {

        for (let i = results.length; --i >= 0;) {

          const student = document.getElementById(results[i].id);
          student && (student.innerHTML = iconOk);
        }

        document.getElementById('inputImg').src = '/attendance/result-image?r=' + Math.random().toString(36).substring(7);
      }
      input instanceof HTMLImageElement && loading && loading.classList.add('is-hidden');
    }
  }
  catch (err) { console.error(err) }
}

function previewImgTemplate() {

  const boxDiv = createElement('div', { class: 'box' });
  const fig = createElement('figure', { class: 'image is-relative' });
  const canvas = createElement('canvas', { id: 'overlay' });
  const img = createElement('img', { id: 'inputImg' });
  const loadingDiv = createElement('div', { class: 'loading is-hidden' });
  const childDiv = createElement('div', { class: 'is-relative has-text-centered has-text-black' });
  const spanIcon = createElement('span', { class: 'icon is-size-1' });
  const i = createElement('i', { class: 'icon-loading animate-spin' });
  const p = createElement('p', { class: 'is-size-5' });

  p.innerText = 'Đang nhận diện...';
  spanIcon.appendChild(i);
  childDiv.appendChild(spanIcon);
  childDiv.appendChild(p);
  loadingDiv.appendChild(childDiv);

  fig.appendChild(img);
  fig.appendChild(canvas);
  fig.appendChild(loadingDiv);

  boxDiv.appendChild(fig);

  return boxDiv.outerHTML;
}

function previewCamTemplate() {

  const row1 = createElement('div', { class: 'columns is-centered' });
  const columnRow1 = createElement('div', { class: 'column is-narrow' });
  const buttons = createElement('div', { class: 'buttons' });
  const btnStopCam = createElement('button', { class: 'button is-outlined is-info', type: 'button', id: 'stopCamera' });
  const btnTakePhoto = createElement('button', { class: 'button is-outlined is-info', type: 'button', id: 'takeAShot' });
  const boxVideo = createElement('div', { class: 'box' });
  const video = createElement('video', { id: 'camera', autoplay: 'autoplay' });
  const columnImg = previewImgTemplate();

  btnStopCam.innerText = 'Dừng quay';
  btnTakePhoto.innerText = 'Cười lên :)';
  buttons.append(btnStopCam, btnTakePhoto);
  columnRow1.appendChild(buttons);
  row1.appendChild(columnRow1);

  boxVideo.appendChild(video);
  boxVideo.insertAdjacentHTML('beforeend', columnImg);

  return row1.outerHTML + boxVideo.outerHTML;
}

function previewLiveCamTemplate() {

  const row1 = createElement('div', { class: 'columns is-centered' });
  const columnBtn = createElement('div', { class: 'column is-narrow' });
  const btnStopCam = createElement('button', { class: 'button is-outlined is-info', type: 'button', id: 'stopCamera' });
  const box = createElement('div', { class: 'box is-relative' });
  const video = createElement('video', { id: 'camera', autoplay: 'autoplay' });
  const canvas = createElement('canvas', { id: 'overlay' });

  btnStopCam.innerText = 'Dừng quay';
  columnBtn.appendChild(btnStopCam);
  row1.appendChild(columnBtn);

  box.append(video, canvas);

  return row1.outerHTML + box.outerHTML;
}

function checkByHand() {

  const isAbsent = !this.classList.contains('has-text-info');
  const body = {
    classId: document.getElementById('classId').value,
    studentId: this.parentNode.id,
    isAbsent
  }

  fetch('/attendance/check-by-hand', {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(res => {

      if (res.ok) {

        if (isAbsent) {

          this.classList.remove('has-text-grey-lighter');
          this.classList.add('has-text-info');
        }
        else {
          this.classList.add('has-text-grey-lighter');
          this.classList.remove('has-text-info');
        }
      }
    })
    .catch(console.error);
}
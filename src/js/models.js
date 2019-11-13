import '../scss/test/models.scss';
import previewUploadedImages from './preview-uploaded-image';
import { createElement, removeChilds } from './dom';

window.addEventListener('load', () => {

  const editable = document.getElementById('editable');
  let selectedContainer = null;
  const options = {
    autoCropArea: .3,
    dragMode: 'move',
    guides: false,
    highlight: false,
    minCanvasHeight: 500,
    minContainerHeight: 500,
    preview: editable,
    toggleDragModeOnDblclick: false,
    viewMode: 3,
  };
  let cropper = new Cropper(editable, options);
  const croppedData = [];

  document.addEventListener('click', function(e) {

    if (null !== e.target.closest('.image-preview')) {

      const target = e.target.closest('.image-preview');

      selectedContainer = document.querySelector('.image.selected');
      selectedContainer && selectedContainer.classList.remove('selected');
      if (selectedContainer !== target) selectedContainer = target;
      selectedContainer.classList.add('selected');
      editable.src = e.target.src;

      cropper.replace(e.target.src);
    }
  }, false);

  const inputFile = document.querySelector('.file-input');
  const preview = document.querySelector('.tile.is-ancestor');
  inputFile.addEventListener('change', function() {

    if (this.files.length > 5) {

      this.value = '';
      showNoti('Maximum is 5 images');
    }
  }, false);
  previewUploadedImages(inputFile, preview, previewTemplate);

  document.getElementById('resetBtn').addEventListener('click', (e) => {

    if (cropper && null !== selectedContainer) {

      cropper.reset();
      selectedContainer.querySelector('img').src = editable.src;
    }
  }, false);

  document.getElementById('cropBtn').addEventListener('click', (e) => {

    if (cropper && null !== selectedContainer) {

      const canvas = cropper.getCroppedCanvas({ imageSmoothingQuality: 'high' });

      canvas.toBlob((blob) => { croppedData.push(blob) });
      selectedContainer.querySelector('img').src = canvas.toDataURL();
    }
  }, false);

  document.getElementById('upload').addEventListener('submit', function(e) {

    e.preventDefault();

    const btnUpload = this.querySelector('.button.is-info');
    const inputName = this.querySelector('input[name="name"]');
    const formData = new FormData();

    btnUpload.classList.add('is-loading');

    formData.append('name', inputName.value.trim());
    if (croppedData.length > 0) {

      for (const blob of croppedData)
        formData.append('models', blob, Math.random().toString(8).substr(2, 7) + '.png');
    }
    else {
      for (const file of inputFile.files)
        formData.append('models', file);
    }

    fetch('/models/upload', {
        cache: 'no-cache',
        credentials: 'same-origin',
        method: 'post',
        body: formData
      })
      .then(res => {

        inputName.value = '';
        inputFile.value = '';
        croppedData.length = 0;
        btnUpload.classList.remove('is-loading');
        res.ok ? showNoti('Uploaded') : showNoti('Upload failed');
      })
      .catch(console.error);

    cropper && cropper.destroy();
    cropper = new Cropper(editable, options);
    removeChilds(document.querySelector('.tile.is-ancestor'));

  }, false);
}, false);

function showNoti(msg) {

  const noti = document.querySelector('.notification');
  noti.innerText = msg;
  noti.classList.remove('is-hidden');
  setTimeout(() => { noti.classList.add('is-hidden'); }, 2500);
}

function previewTemplate(images) {

  let html = '';

  switch (images.length) {
    case 1:
      html = appendImages(images);
      break;
    case 2:
      html = appendImages([images[0]]) + appendImages([images[1]]);
      break;
    case 3:
      html = appendImages([images[0]]) + appendImages([images[1]]) + appendImages([images[2]]);
      break;
    case 4:
      html = appendImages([images[0], images[1]]) + appendImages([images[2], images[3]]);
      break;
    case 5:
      html = appendImages([images[0], images[1]]) + appendImages([images[4]]) + appendImages([images[2], images[3]]);
      break;
  }

  return html;
}

function appendImages(images) {

  const parentDiv = createElement('div', { class: 'tile is-parent is-vertical' });

  for (const image of images) {

    const childDiv = createElement('div', { class: 'tile is-child' });
    const fig = createElement('figure', { class: 'image image-preview' });

    fig.appendChild(image);
    childDiv.appendChild(fig);
    parentDiv.appendChild(childDiv);
  }

  return parentDiv.outerHTML;
}
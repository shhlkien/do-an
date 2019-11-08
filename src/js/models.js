import '../scss/test/models.scss';
import previewUploadedImages from './preview-uploaded-image';
import { removeChilds } from './html-element';

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
  previewUploadedImages(inputFile, preview);

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

    const inputName = this.querySelector('input[name="name"]');
    const formData = new FormData();

    formData.append('name', inputName.value.trim());
    if (croppedData.length > 0) {

      for (const blob of croppedData)
        formData.append('models', blob, Math.random().toString(8).substr(2, 7) + '.png');
    }
    else {
      for (const file of inputFile.files)
        formData.append('models', file);
    }

    fetch('/upload', {
        cache: 'no-cache',
        credentials: 'same-origin',
        method: 'post',
        body: formData
      })
      .then(res => {
        console.info(res)
        inputName.value = '';
        inputFile.value = '';
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
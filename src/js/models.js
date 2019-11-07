import '../scss/test/models.scss';
import previewUploadedImages from './preview-uploaded-image';
import { removeChilds } from './html-element';

window.addEventListener('load', () => {

  const editable = document.getElementById('editable');
  let selectedContainer = null;
  let cropper;
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
    ready: function(e) {
      console.log(e.type);
    },
    cropstart: function(e) {
      console.log(e.type, e.detail.action);
    },
    cropmove: function(e) {
      console.log(e.type, e.detail.action);
    },
    cropend: function(e) {
      console.log(e.type, e.detail.action);
    },
    crop: function(e) {
      console.log(e.type, e.detail);
    },
    zoom: function(e) {
      console.log(e.type, e.detail.ratio);
    }
  };

  document.addEventListener('click', function(e) {

    if (null !== e.target.closest('.image-preview')) {

      const target = e.target.closest('.image-preview');

      selectedContainer = document.querySelector('.image.selected');
      selectedContainer && selectedContainer.classList.remove('selected');
      if (selectedContainer !== target) selectedContainer = target;
      selectedContainer.classList.add('selected');
      editable.src = e.target.src;

      cropper && cropper.destroy();
      cropper = new Cropper(editable, options);
    }
  }, false);

  const fileInput = document.querySelector('.file-input');
  const preview = document.querySelector('.tile.is-ancestor');
  fileInput.addEventListener('change', function() {

    if (this.files.length > 5) {

      this.value = '';
      showNoti('Maximum is 5 images');
    }
  }, false);
  previewUploadedImages(fileInput, preview);

  document.getElementById('resetBtn').addEventListener('click', (e) => {

    if (cropper && null !== selectedContainer) {

      cropper.reset();
      selectedContainer.querySelector('img').src = editable.src;
    }
  }, false);

  document.getElementById('cropBtn').addEventListener('click', (e) => {

    if (cropper && null !== selectedContainer) {

      const canvas = cropper.getCroppedCanvas();
      selectedContainer.querySelector('img').src = canvas.toDataURL();
    }
  }, false);

  document.getElementById('upload').addEventListener('submit', function(e) {

    e.preventDefault();

    const inputName = this.querySelector('input[name="name"]');
    const formData = new FormData();
    formData.append('name', inputName.value.trim());
    for (const file of fileInput.files)
      formData.append('models', file, file.name);

    fetch('/upload', {
        cache: 'no-cache',
        credentials: 'same-origin',
        method: 'post',
        body: formData
      })
      .then(res => {
        console.info(res)
        inputName.value = '';
        fileInput.value = '';
        showNoti('Uploaded');
      })
      .catch(console.error);

    cropper && cropper.destroy();
    removeChilds(document.querySelector('.tile.is-ancestor'));

  }, false);
}, false);

function showNoti(msg) {

  const noti = document.querySelector('.notification');
  noti.innerText = msg;
  noti.classList.remove('is-hidden');
  setTimeout(() => { noti.classList.add('is-hidden'); }, 2500);
}
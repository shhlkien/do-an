import { createElement } from './html-element';

export default function previewUploadedImages(inputImages, preview) {

  if (window.File && window.FileReader && window.FileList && window.Blob)
    inputImages.addEventListener('change', function() { previewFiles(preview, this.files); }, false);
  else console.warn('Browser does not support file api');
}

function previewFiles(preview, files) {

  if (files.length === 0) return;

  const images = [];

  for (const file of files) {

    // if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
    if (file && file.type.match('image.*')) {

      const fr = new FileReader();

      fr.addEventListener('load', function() {

        const image = new Image();
        image.title = file.name;
        image.src = this.result;

        if (images.length < files.length) images.push(image);
        if (images.length === files.length) { preview.innerHTML = previewTemplate(images); }
      }, false);

      fr.readAsDataURL(file);
    }
  }
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
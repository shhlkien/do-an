/**
 * @param {HTML Element} inputImages input type file accepts images
 * @param {HTML Element} preview element to view the uploaded images
 * @param {function}     previewTemplate custom template to show images
 */
export default function previewUploadedImages(inputImages, preview, previewTemplate) {

  if (window.File && window.FileReader && window.FileList && window.Blob)
    inputImages.addEventListener('change', function() { previewFiles(preview, this.files, previewTemplate) }, false);
  else console.warn('Browser does not support file api');
}

function previewFiles(preview, files, previewTemplate) {

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
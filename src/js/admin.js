import '../images/favicon.ico';
import '../scss/test/admin.scss';

import logout from './logout';
import ajax from './ajax';

window.addEventListener('load', () => {

  document.getElementById('logout').addEventListener('click', function(e) {

    e.preventDefault();
    logout();
  }, false);

  document.getElementById('file').addEventListener('change', function(e) {

    const file = this.files[0];

    document.querySelector('.file-name').innerText = file.name;
  }, false);

  document.getElementById('lecturer').addEventListener('click', function(e) {

    e.preventDefault();

    document.querySelector('.modal').classList.add('is-active');
    document.getElementById('file').setAttribute('name', 'lecturerList');
  }, false);

  document.getElementById('student').addEventListener('click', function(e) {

    e.preventDefault();

    document.querySelector('.modal').classList.add('is-active');
    document.getElementById('file').setAttribute('name', 'studentList');
  }, false);

  document.getElementById('uploadForm').addEventListener('submit', (e) => {

    e.preventDefault();

    const formData = new FormData();
    const fileEl = document.getElementById('file');

    formData.append(fileEl.getAttribute('name'), fileEl.files[0]);

    ajax({
        url: 'lecturerList' === fileEl.getAttribute('name') ? '/admin' : '/student',
        method: 'post',
        data: formData
      })
      .then(res => {

        if (201 === res.status)
          window.location.reload();
        else {
          const help = document.querySelector('.help');
          const response = JSON.parse(res.response);

          help.innerText = response.error;
          help.classList.remove('is-hidden');
        }
      })
      .catch(console.error);
  }, false);

  document.querySelector('.btnCancel').addEventListener('click', () => {

    document.querySelector('.modal.is-active').classList.remove('is-active');
  }, false);
}, false);
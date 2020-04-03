import '../images/favicon.ico';
import '../scss/test/home.scss';

import logout from './logout';
import ajax from './ajax';

window.addEventListener('load', () => {

  document.getElementById('logout').addEventListener('click', (e) => {

    e.preventDefault();
    logout();
  }, false);

  document.getElementById('addClass').addEventListener('click', () => {

    document.querySelector('.modal').classList.add('is-active');
  }, false);

  document.getElementById('btnCancel').addEventListener('click', () => {

    document.querySelector('.modal').classList.remove('is-active');
  }, false);

  document.getElementById('file').addEventListener('change', function(e) {

    const file = this.files[0];

    document.querySelector('.file-name').innerText = file.name;
  }, false);

  document.querySelector('form').addEventListener('submit', (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append('class', document.getElementById('file').files[0]);

    ajax({
        url: '/class',
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
}, false);
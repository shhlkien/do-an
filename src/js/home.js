import '../images/favicon.ico';
import '../scss/test/home.scss';

import 'datepickerx/dist/js/DatePickerX';

import logout from './logout';
import ajax from './ajax';

const datepickerOptions = {
  format: 'dd/mm/yyyy',
  weekDayLabels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  shortMonthLabels: ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'],
  todayButtonLabel: 'Hôm nay',
  clearButtonLabel: 'Xóa'
};

window.addEventListener('load', () => {

  document.getElementById('from').DatePickerX.init(datepickerOptions);
  document.getElementById('to').DatePickerX.init(datepickerOptions);

  document.getElementById('logout').addEventListener('click', (e) => {

    e.preventDefault();
    logout();
  }, false);

  document.getElementById('addClass').addEventListener('click', () => {

    document.getElementById('uploadForm').closest('.modal').classList.add('is-active');
  }, false);

  document.querySelectorAll('.btnCancel').forEach(el => {

    el.addEventListener('click', () => {

      document.querySelector('.modal.is-active').classList.remove('is-active');
    }, false);
  });

  document.getElementById('file').addEventListener('change', function(e) {

    const file = this.files[0];

    document.querySelector('.file-name').innerText = file.name;
  }, false);

  document.getElementById('uploadForm').addEventListener('submit', (e) => {

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

  document.querySelectorAll('[download]').forEach(el => {

    el.addEventListener('click', function(e) {

      e.preventDefault();

      document.getElementById('downloadForm').setAttribute('action', el.href);
      document.getElementById('downloadForm').closest('.modal').classList.add('is-active');
    }, false);
  });

  document.getElementById('downloadForm').addEventListener('submit', function(e) {

    e.preventDefault();

    const formData = new FormData();

    ajax({
        url: this.getAttribute('action'),
        data: formData
      })
      .then(response => {

        console.info(`home.js:87: `, response)

      })
      .catch(console.error);
  }, false);
}, false);
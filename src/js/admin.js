import '../images/favicon.ico';
import '../scss/test/admin.scss';

import logout from './logout';

window.addEventListener('load', () => {

  document.getElementById('logout').addEventListener('click', function(e) {

    e.preventDefault();
    logout();
  }, false);
}, false);
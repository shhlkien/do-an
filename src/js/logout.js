import ajax from './ajax';

export default function() {

  ajax({
      url: '/auth',
      method: 'post',
      data: JSON.stringify({ action: 'logout' }),
      headers: ['content-type: application/json']
    })
    .then(res => {

      if (200 === res.status && 'logged out' === res.responseText) window.location = '/auth';
    })
    .catch(console.error);
}
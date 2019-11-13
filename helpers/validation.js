exports.allowedFile = function(filename) {

  const disallowed = ['rar', 'zip', 'exe', 'php', 'js', 'htm', 'html', 'bat', 'vbs'];
  const ext = /\.(\w+)$/i;

  return (filename.match(ext) !== null) && (disallowed.indexOf(filename.match(ext)[1].toLowerCase()) < 0);
}

exports.isEmpty = function(o, type) {

  if (o === null ||
    (Array.isArray(o) && o.length === 0) ||
    (typeof o === 'string' && o.trim() === '') ||
    (typeof o === 'object' && Object.keys(o).length === 0))
    return true;

  return false;
}
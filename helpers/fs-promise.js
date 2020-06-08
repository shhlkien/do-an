const fs = require('fs');

exports.exists = (path) => {

  return new Promise((resolve, reject) => {

    fs.access(path, err => {

      if (err) resolve(false);
      resolve(true);
    });
  });
}

exports.mkdir = (path, mode = 766) => {

  return new Promise((resolve, reject) => {

    fs.mkdir(path, { mode }, err => {

      if (err) reject(err);
      resolve();
    });
  });
}

exports.rename = (oldPath, newPath) => {

  return new Promise((resolve, reject) => {

    fs.rename(oldPath, newPath, err => {

      if (err) reject(err);
      resolve();
    });
  });
}

exports.writeFile = (path, data) => {

  return new Promise((resolve, reject) => {

    fs.writeFile(path, data, err => {

      if (err) reject(err);
      resolve();
    });
  });
}

exports.readFile = (path) => {

  return new Promise((resolve, reject) => {

    fs.readFile(path, (err, data) => {

      if (err) reject(err);
      resolve(data);
    });
  })
}

exports.readDir = (path, options = {
  encoding: 'utf8',
  withFileTypes: true
}) => {

  return new Promise((resolve, reject) => {

    fs.readdir(path, options, (err, files) => {

      if (err) reject(err);
      resolve(files);
    });
  });
}
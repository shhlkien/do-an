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
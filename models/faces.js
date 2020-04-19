const { Schema, model } = require('mongoose');

const faceSchema = new Schema({
  faceMatcher: {}
});

exports.Face = model('Face', faceSchema);
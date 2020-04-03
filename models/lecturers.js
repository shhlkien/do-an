const { Schema, model } = require('mongoose');

const lecturerSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

exports.Lecturer = model('Lecturer', lecturerSchema);
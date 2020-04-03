const { Schema, model } = require('mongoose');

const studentSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  images: Array
}, { id: false });

exports.Student = model('Student', studentSchema);
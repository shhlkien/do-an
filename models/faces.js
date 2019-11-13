const { Schema, model } = require('mongoose');

const personSchema = new Schema({
  name: { type: String, required: true }
});

const facesSchema = new Schema({
  name: { type: String, required: true },
  models: { type: [String], required: true }
});

exports.Faces = model('Faces', facesSchema);
exports.Person = model('Person', personSchema);
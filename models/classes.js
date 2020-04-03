const { Schema, model } = require('mongoose');

const classSchema = new Schema({
  name: { type: String, required: true },
  subject: {
    id: String,
    name: String
  },
  lecturer: { type: Schema.Types.ObjectId, ref: 'Lecturer' },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
});

exports.Class = model('Class', classSchema);
const { Schema, model } = require('mongoose');

const attendanceSchema = new Schema({
  date: { type: Date, default: Date.now },
  _class: { type: Schema.Types.ObjectId, ref: 'Class' },
  students: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    isAbsent: { type: Boolean, default: true }
  }]
});

exports.Attendance = model('Attendance', attendanceSchema);
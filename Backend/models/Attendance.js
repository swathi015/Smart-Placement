import { Schema, model } from 'mongoose';

const attendanceSchema = new Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Please add event name'],
    },
    date: {
      type: Date,
      required: [true, 'Please add event date'],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure attendance is recorded once per student per event
attendanceSchema.index({ eventName: 1, student: 1, date: 1 }, { unique: true });

export default model('Attendance', attendanceSchema);
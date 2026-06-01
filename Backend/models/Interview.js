import { Schema, model } from 'mongoose';

const interviewSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add interview date and time'],
    },
    mode: {
      type: String,
      enum: ['online', 'offline'],
      required: [true, 'Please specify interview mode'],
    },
    linkOrVenue: {
      type: String,
      required: [true, 'Please add online meet link or physical venue'],
    },
    roundName: {
      type: String,
      default: 'Technical Interview',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default model('Interview', interviewSchema);
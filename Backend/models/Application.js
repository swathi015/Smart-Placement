import { Schema, model } from 'mongoose';

const applicationSchema = new Schema(
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
    resumeUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'screening', 'test', 'interview', 'offered', 'rejected'],
      default: 'applied',
    },
    feedback: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a student can apply to a job only once
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

export default model('Application', applicationSchema);
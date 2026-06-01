import { Schema, model } from 'mongoose';

const studentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Please add a roll number'],
      unique: true,
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
    },
    cgpa: {
      type: Number,
      required: [true, 'Please add CGPA'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot be more than 10'],
    },
    backlogs: {
      type: Number,
      default: 0,
      min: [0, 'Backlogs cannot be negative'],
    },
    skills: {
      type: [String],
      default: [],
    },
    graduationYear: {
      type: Number,
      required: [true, 'Please add graduation year'],
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumePublicId: {
      type: String,
      default: '',
    },
    placementStatus: {
      type: String,
      enum: ['unplaced', 'placed', 'eligible', 'ineligible'],
      default: 'unplaced',
    },
    appliedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model('Student', studentSchema);
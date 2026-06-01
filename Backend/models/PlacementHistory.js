import { Schema, model } from 'mongoose';

const placementHistorySchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add company name'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Please add job title'],
    },
    package: {
      type: Number, // LPA
      required: [true, 'Please add package in LPA'],
    },
    academicYear: {
      type: String, // e.g., "2025-2026"
      required: [true, 'Please add academic year'],
    },
    selectionDate: {
      type: Date,
      default: Date.now,
    },
    offerLetterUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default model('PlacementHistory', placementHistorySchema);
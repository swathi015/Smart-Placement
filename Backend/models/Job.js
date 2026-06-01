import { Schema, model } from 'mongoose';

const jobSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    description: {
      type: String,
      required: [true, 'Please add job description'],
    },
    requirements: {
      type: String,
      required: [true, 'Please add job requirements'],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    minCGPA: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    maxBacklogs: {
      type: Number,
      default: 0,
    },
    package: {
      type: Number, // LPA
      required: [true, 'Please add package details in LPA'],
    },
    location: {
      type: String,
      required: [true, 'Please add job location'],
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Contract', 'Co-op'],
      default: 'Full-time',
    },
    deadline: {
      type: Date,
      required: [true, 'Please add application deadline'],
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model('Job', jobSchema);
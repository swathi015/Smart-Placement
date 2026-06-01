import { Schema, model } from 'mongoose';

const companySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add company name'],
      unique: true,
    },
    industry: {
      type: String,
      required: [true, 'Please add industry type'],
    },
    website: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      required: [true, 'Please add contact email'],
    },
    contactPhone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default model('Company', companySchema);
import Job from '../models/Job.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all job postings (filterable)
// @route   GET /api/jobs
// @access  Private
const getAllJobs = asyncHandler(async (req, res) => {
  const { title, jobType, location, minPackage, status } = req.query;
  const filter = {};

  if (title) filter.title = { $regex: title, $options: 'i' };
  if (jobType) filter.jobType = jobType;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (minPackage) filter.package = { $gte: Number(minPackage) };
  if (status) filter.status = status;

  const jobs = await Job.find(filter).populate('company', 'companyName website industry');
  res.json(jobs);
});

// @desc    Get a single job details
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company', 'companyName website description industry contactEmail contactPhone');

  if (job) {
    res.json(job);
  } else {
    res.status(404);
    throw new Error('Job posting not found');
  }
});

export {
  getAllJobs,
  getJobById,
};
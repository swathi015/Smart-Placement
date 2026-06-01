import Company from '../models/Company.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get company profile details
// @route   GET /api/companies/profile
// @access  Private/Company
const getCompanyProfile = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id }).populate('user', '-password');
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }
  res.json(company);
});

// @desc    Update company profile
// @route   PUT /api/companies/profile
// @access  Private/Company
const updateCompanyProfile = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });

  if (company) {
    company.companyName = req.body.companyName || company.companyName;
    company.industry = req.body.industry || company.industry;
    company.website = req.body.website || company.website;
    company.description = req.body.description || company.description;
    company.contactEmail = req.body.contactEmail || company.contactEmail;
    company.contactPhone = req.body.contactPhone || company.contactPhone;

    const updatedCompany = await company.save();

    if (req.body.name) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name;
        await user.save();
      }
    }

    res.json(updatedCompany);
  } else {
    res.status(404);
    throw new Error('Company profile not found');
  }
});

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private/Admin/Coordinator
const getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find().populate('user', 'name email isApproved');
  res.json(companies);
});

// @desc    Post a new job
// @route   POST /api/companies/jobs
// @access  Private/Company
const postJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  const { title, description, requirements, skillsRequired, minCGPA, maxBacklogs, package: packageOffer, location, jobType, deadline } = req.body;

  const job = await Job.create({
    company: company._id,
    title,
    description,
    requirements,
    skillsRequired: skillsRequired || [],
    minCGPA: minCGPA || 0,
    maxBacklogs: maxBacklogs || 0,
    package: packageOffer,
    location,
    jobType,
    deadline,
  });

  res.status(201).json(job);
});

// @desc    Get jobs posted by company
// @route   GET /api/companies/jobs
// @access  Private/Company
const getJobsPosted = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  const jobs = await Job.find({ company: company._id });
  res.json(jobs);
});

// @desc    Update posted job details
// @route   PUT /api/companies/jobs/:id
// @access  Private/Company
const updateJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  const job = await Job.findById(req.params.id);

  if (job) {
    if (job.company.toString() !== company._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to edit this job');
    }

    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.requirements = req.body.requirements || job.requirements;
    job.skillsRequired = req.body.skillsRequired || job.skillsRequired;
    job.minCGPA = req.body.minCGPA !== undefined ? req.body.minCGPA : job.minCGPA;
    job.maxBacklogs = req.body.maxBacklogs !== undefined ? req.body.maxBacklogs : job.maxBacklogs;
    job.package = req.body.package || job.package;
    job.location = req.body.location || job.location;
    job.jobType = req.body.jobType || job.jobType;
    job.deadline = req.body.deadline || job.deadline;
    job.status = req.body.status || job.status;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

export {
  getCompanyProfile,
  updateCompanyProfile,
  getAllCompanies,
  postJob,
  getJobsPosted,
  updateJob,
};
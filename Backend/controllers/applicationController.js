import Application from '../models/Application.js';
import Student from '../models/Student.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import PlacementHistory from '../models/PlacementHistory.js';
import { checkStudentEligibilityForJob } from '../services/eligibilityService.js';
import { sendApplicationStatusEmail } from '../services/emailService.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Apply to a job
// @route   POST /api/applications/apply/:jobId
// @access  Private/Student
const applyToJob = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('user');
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const job = await Job.findById(req.params.jobId).populate('company');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.status !== 'open') {
    res.status(400);
    throw new Error('Applications for this job are closed');
  }

  // Check eligibility
  const eligibility = await checkStudentEligibilityForJob(student._id, job._id);
  if (!eligibility.eligible) {
    res.status(400);
    res.json({
      message: 'You are not eligible for this job',
      reasons: eligibility.reasons,
    });
    return;
  }

  // Check if resume is uploaded
  if (!student.resumeUrl) {
    res.status(400);
    throw new Error('Please upload your resume before applying');
  }

  // Check for duplicate application
  const existingApplication = await Application.findOne({
    job: job._id,
    student: student._id,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('You have already applied for this job');
  }

  const application = await Application.create({
    job: job._id,
    student: student._id,
    resumeUrl: student.resumeUrl,
  });

  // Increment application count
  job.applicantsCount += 1;
  await job.save();

  // Push to student appliedJobs array
  student.appliedJobs.push(job._id);
  await student.save();

  // Create notification for student
  await Notification.create({
    recipient: req.user._id,
    title: 'Job Applied Successfully',
    message: `You have successfully applied for the position of ${job.title} at ${job.company.companyName}.`,
    type: 'job',
  });

  res.status(201).json(application);
});

// @desc    Get all applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private/Company/Coordinator/Admin
const getApplicationsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // If role is company, verify company ownership
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user._id });
    if (!company || job.company.toString() !== company._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access applications for this job');
    }
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    });

  res.json(applications);
});

// @desc    Get student applications
// @route   GET /api/applications/my-applications
// @access  Private/Student
const getStudentApplications = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const applications = await Application.find({ student: student._id })
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'companyName' },
    });

  res.json(applications);
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Company/Coordinator/Admin
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;
  const application = await Application.findById(req.params.id)
    .populate({
      path: 'student',
      populate: { path: 'user' },
    })
    .populate({
      path: 'job',
      populate: { path: 'company' },
    });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // If company, verify company ownership of the job
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user._id });
    if (!company || application.job.company._id.toString() !== company._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update status for this job application');
    }
  }

  application.status = status || application.status;
  application.feedback = feedback !== undefined ? feedback : application.feedback;

  const updatedApplication = await application.save();

  // If status is 'offered', record placement history & update student status
  if (status === 'offered') {
    const student = await Student.findById(application.student._id);
    if (student) {
      student.placementStatus = 'placed';
      await student.save();

      // Create placement history record
      await PlacementHistory.create({
        student: student._id,
        companyName: application.job.company.companyName,
        jobTitle: application.job.title,
        package: application.job.package,
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        selectionDate: new Date(),
      });
    }
  }

  // Send email alert to student
  await sendApplicationStatusEmail(
    application.student.user.email,
    application.student.user.name,
    {
      jobTitle: application.job.title,
      companyName: application.job.company.companyName,
      status: application.status,
      feedback: application.feedback,
    }
  );

  // Send app notification
  await Notification.create({
    recipient: application.student.user._id,
    title: 'Application Status Updated',
    message: `Your application for ${application.job.title} at ${application.job.company.companyName} has been marked as ${application.status}.`,
    type: 'job',
  });

  res.json(updatedApplication);
});

export {
  applyToJob,
  getApplicationsForJob,
  getStudentApplications,
  updateApplicationStatus,
};
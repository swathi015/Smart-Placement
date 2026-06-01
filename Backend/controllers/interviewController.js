import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import Student from '../models/Student.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import Company from '../models/Company.js';
import { sendInterviewScheduleEmail } from '../services/emailService.js';
import { formatDateTime } from '../utils/formatDate.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Schedule a new interview
// @route   POST /api/interviews
// @access  Private/Company/Coordinator/Admin
const scheduleInterview = asyncHandler(async (req, res) => {
  const { applicationId, date, mode, linkOrVenue, roundName } = req.body;

  const application = await Application.findById(applicationId)
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

  // If role is company, verify company ownership
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user._id });
    if (!company || application.job.company._id.toString() !== company._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to schedule interviews for this application');
    }
  }

  const interview = await Interview.create({
    job: application.job._id,
    student: application.student._id,
    application: application._id,
    date,
    mode,
    linkOrVenue,
    roundName,
  });

  // Update application status to 'interview'
  application.status = 'interview';
  await application.save();

  // Send Email notification
  await sendInterviewScheduleEmail(
    application.student.user.email,
    application.student.user.name,
    {
      jobTitle: application.job.title,
      companyName: application.job.company.companyName,
      date: formatDateTime(date),
      mode,
      linkOrVenue,
      roundName,
    }
  );

  // Send App notification
  await Notification.create({
    recipient: application.student.user._id,
    title: 'New Interview Scheduled',
    message: `Your interview for ${application.job.title} (${roundName}) is scheduled for ${formatDateTime(date)}. Details sent to email.`,
    type: 'job',
  });

  res.status(201).json(interview);
});

// @desc    Get interviews for current student
// @route   GET /api/interviews/my-interviews
// @access  Private/Student
const getStudentInterviews = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const interviews = await Interview.find({ student: student._id })
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'companyName' },
    })
    .sort({ date: 1 });

  res.json(interviews);
});

// @desc    Get all interviews scheduled for a job
// @route   GET /api/interviews/job/:jobId
// @access  Private/Company/Coordinator/Admin
const getJobInterviews = asyncHandler(async (req, res) => {
  // If role is company, verify company ownership
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user._id });
    const job = await Job.findById(req.params.jobId);
    if (!job || !company || job.company.toString() !== company._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access interviews for this job');
    }
  }

  const interviews = await Interview.find({ job: req.params.jobId })
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    })
    .sort({ date: 1 });

  res.json(interviews);
});

// @desc    Update interview details (cancel, complete, update info)
// @route   PUT /api/interviews/:id
// @access  Private/Company/Coordinator/Admin
const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id)
    .populate({
      path: 'student',
      populate: { path: 'user' },
    })
    .populate({
      path: 'job',
      populate: { path: 'company' },
    });

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  // If role is company, verify company ownership
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user._id });
    if (!company || interview.job.company._id.toString() !== company._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update interviews for this job');
    }
  }

  interview.date = req.body.date || interview.date;
  interview.mode = req.body.mode || interview.mode;
  interview.linkOrVenue = req.body.linkOrVenue || interview.linkOrVenue;
  interview.roundName = req.body.roundName || interview.roundName;
  interview.status = req.body.status || interview.status;
  interview.feedback = req.body.feedback !== undefined ? req.body.feedback : interview.feedback;

  const updatedInterview = await interview.save();

  // Notify student of change
  await Notification.create({
    recipient: interview.student.user._id,
    title: 'Interview Details Updated',
    message: `Your interview status/details for ${interview.job.title} have been updated to: ${interview.status.toUpperCase()}.`,
    type: 'job',
  });

  res.json(updatedInterview);
});

export {
  scheduleInterview,
  getStudentInterviews,
  getJobInterviews,
  updateInterview,
};
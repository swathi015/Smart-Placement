import Student from '../models/Student.js';
import User from '../models/User.js';
import { uploadResumeToCloudinary, deleteResumeFromCloudinary } from '../services/resumeUploadService.js';
import { getEligibleJobsForStudent } from '../services/eligibilityService.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get student profile details
// @route   GET /api/students/profile
// @access  Private/Student
const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('user', '-password');
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  res.json(student);
});

// @desc    Update student profile details
// @route   PUT /api/students/profile
// @access  Private/Student
const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });

  if (student) {
    student.rollNumber = req.body.rollNumber || student.rollNumber;
    student.department = req.body.department || student.department;
    student.cgpa = req.body.cgpa !== undefined ? req.body.cgpa : student.cgpa;
    student.backlogs = req.body.backlogs !== undefined ? req.body.backlogs : student.backlogs;
    student.skills = req.body.skills || student.skills;
    student.graduationYear = req.body.graduationYear || student.graduationYear;
    student.placementStatus = req.body.placementStatus || student.placementStatus;

    const updatedStudent = await student.save();
    
    // Update matching name on main User model if provided
    if (req.body.name) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name;
        await user.save();
      }
    }

    res.json(updatedStudent);
  } else {
    res.status(404);
    throw new Error('Student profile not found');
  }
});

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin/Coordinator/Company
const getAllStudents = asyncHandler(async (req, res) => {
  const { department, minCGPA, placementStatus, graduationYear } = req.query;
  const filter = {};

  if (department) filter.department = department;
  if (minCGPA) filter.cgpa = { $gte: Number(minCGPA) };
  if (placementStatus) filter.placementStatus = placementStatus;
  if (graduationYear) filter.graduationYear = Number(graduationYear);

  const students = await Student.find(filter).populate('user', 'name email role');
  res.json(students);
});

// @desc    Upload student resume
// @route   POST /api/students/resume
// @access  Private/Student
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // Delete old resume if present
  if (student.resumePublicId) {
    try {
      await deleteResumeFromCloudinary(student.resumePublicId);
    } catch (err) {
      console.warn('Failed to delete old resume:', err.message);
    }
  }

  // Upload to Cloudinary
  const uploadResult = await uploadResumeToCloudinary(req.file.buffer, req.file.originalname);

  student.resumeUrl = uploadResult.secure_url;
  student.resumePublicId = uploadResult.public_id;
  await student.save();

  res.json({
    message: 'Resume uploaded successfully',
    resumeUrl: student.resumeUrl,
  });
});

// @desc    Get eligible jobs for student
// @route   GET /api/students/eligible-jobs
// @access  Private/Student
const getEligibleJobs = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const jobs = await getEligibleJobsForStudent(student._id);
  res.json(jobs);
});

export {
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  uploadResume,
  getEligibleJobs,
};
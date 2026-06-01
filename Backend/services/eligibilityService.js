import Student from '../models/Student.js';
import Job from '../models/Job.js';
import calculateEligibility from '../utils/calculateEligibility.js';

/**
 * Checks a specific student's eligibility for a specific job.
 */
const checkStudentEligibilityForJob = async (studentId, jobId) => {
  const student = await Student.findById(studentId).populate('user');
  const job = await Job.findById(jobId).populate('company');

  if (!student || !job) {
    throw new Error('Student or Job not found');
  }

  return calculateEligibility(student, job);
};

/**
 * Gets list of all students eligible for a specific job.
 */
const getEligibleStudentsForJob = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // Fetch all students
  const students = await Student.find().populate('user');

  // Filter based on criteria
  const eligibleStudents = [];
  const ineligibleStudents = [];

  students.forEach((student) => {
    const result = calculateEligibility(student, job);
    if (result.eligible) {
      eligibleStudents.push({
        student,
        reasons: result.reasons,
      });
    } else {
      ineligibleStudents.push({
        student,
        reasons: result.reasons,
      });
    }
  });

  return {
    eligible: eligibleStudents,
    ineligible: ineligibleStudents,
  };
};

/**
 * Gets all open jobs a specific student is eligible for.
 */
const getEligibleJobsForStudent = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  const openJobs = await Job.find({ status: 'open' }).populate('company');
  const eligibleJobs = [];

  openJobs.forEach((job) => {
    const result = calculateEligibility(student, job);
    if (result.eligible) {
      eligibleJobs.push(job);
    }
  });

  return eligibleJobs;
};

export {
  checkStudentEligibilityForJob,
  getEligibleStudentsForJob,
  getEligibleJobsForStudent,
};
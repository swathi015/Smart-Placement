import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Record attendance for a student (or list of students)
// @route   POST /api/attendance
// @access  Private/Admin/Coordinator
const recordAttendance = asyncHandler(async (req, res) => {
  const { eventName, date, records } = req.body; // records: [{ studentId, status, remarks }]

  if (!eventName || !date || !records || !Array.isArray(records)) {
    res.status(400);
    throw new Error('Please provide eventName, date, and array of records');
  }

  const savedAttendance = [];

  for (const record of records) {
    const student = await Student.findById(record.studentId);
    if (!student) continue;

    // Use updateOne with upsert to avoid duplicate recording (due to unique compound index)
    const result = await Attendance.findOneAndUpdate(
      {
        eventName,
        student: record.studentId,
        date: new Date(date),
      },
      {
        status: record.status || 'Present',
        remarks: record.remarks || '',
      },
      {
        new: true,
        upsert: true,
      }
    );
    savedAttendance.push(result);
  }

  res.status(201).json({
    message: 'Attendance recorded successfully',
    count: savedAttendance.length,
    data: savedAttendance,
  });
});

// @desc    Get attendance records for a specific event
// @route   GET /api/attendance/event
// @access  Private/Admin/Coordinator/Company
const getAttendanceByEvent = asyncHandler(async (req, res) => {
  const { eventName } = req.query;

  if (!eventName) {
    res.status(400);
    throw new Error('Please specify eventName query parameter');
  }

  const records = await Attendance.find({ eventName })
    .populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    });

  res.json(records);
});

// @desc    Get attendance records of a student
// @route   GET /api/attendance/student/:studentId
// @access  Private/Admin/Coordinator/Student
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // If role is student, check if request is for self
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || student._id.toString() !== studentId) {
      res.status(403);
      throw new Error('Not authorized to access other student records');
    }
  }

  const records = await Attendance.find({ student: studentId })
    .sort({ date: -1 });

  res.json(records);
});

export {
  recordAttendance,
  getAttendanceByEvent,
  getStudentAttendance,
};
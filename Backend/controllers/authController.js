import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, ...profileDetails } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create base user
  const user = await User.create({
    name,
    email,
    password,
    role,
    isApproved: role === 'student' ? true : false,
  });

  if (user) {
    // If student, create Student profile document
    if (role === 'student') {
      const { rollNumber, department, cgpa, backlogs, skills, graduationYear } = profileDetails;
      await Student.create({
        user: user._id,
        rollNumber: rollNumber || `ROLL-${Date.now()}`,
        department: department || 'General',
        cgpa: cgpa || 0,
        backlogs: backlogs || 0,
        skills: skills || [],
        graduationYear: graduationYear || new Date().getFullYear(),
      });
    }

    // If company, create Company profile document
    if (role === 'company') {
      const { companyName, industry, website, description, contactEmail, contactPhone } = profileDetails;
      await Company.create({
        user: user._id,
        companyName: companyName || name,
        industry: industry || 'IT',
        website: website || '',
        description: description || '',
        contactEmail: contactEmail || email,
        contactPhone: contactPhone || '',
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.isApproved) {
      res.status(403);
      throw new Error('Your registration request is pending approval by admin');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    let profile = null;

    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === 'company') {
      profile = await Company.findOne({ user: user._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get pending users for approval (Companies/Coordinators)
// @route   GET /api/auth/pending
// @access  Private/Admin
const getPendingUsers = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({ isApproved: false });
  
  const detailedPending = [];

  for (const user of pendingUsers) {
    let details = {};
    if (user.role === 'company') {
      details = await Company.findOne({ user: user._id });
    }
    detailedPending.push({ user, details });
  }

  res.json(detailedPending);
});

// @desc    Approve user account
// @route   PUT /api/auth/approve/:id
// @access  Private/Admin
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isApproved = true;
    await user.save();

    // If company, update their company status as well
    if (user.role === 'company') {
      const company = await Company.findOne({ user: user._id });
      if (company) {
        company.status = 'approved';
        await company.save();
      }
    }

    res.json({ message: 'User account has been approved successfully', user });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  getPendingUsers,
  approveUser,
};
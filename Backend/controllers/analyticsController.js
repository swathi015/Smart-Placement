import { getDashboardStats, getCompanyStats } from '../services/analyticsService.js';
import Company from '../models/Company.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get global dashboard placement analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin/Coordinator
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  res.json(stats);
});

// @desc    Get company specific application and selection stats
// @route   GET /api/analytics/company
// @access  Private/Company
const getCompanyDashboardStats = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  const stats = await getCompanyStats(company._id);
  res.json(stats);
});

export {
  getAdminDashboardStats,
  getCompanyDashboardStats,
};
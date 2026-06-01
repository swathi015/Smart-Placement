import Student from '../models/Student.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import PlacementHistory from '../models/PlacementHistory.js';
import Interview from '../models/Interview.js';

const getDashboardStats = async () => {
  const totalStudents = await Student.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();

  // Placement history analysis
  const placements = await PlacementHistory.find();
  const totalPlaced = placements.length;
  const placementRate = totalStudents > 0 ? (totalPlaced / totalStudents) * 100 : 0;

  // Package statistics
  let highestPackage = 0;
  let averagePackage = 0;
  if (placements.length > 0) {
    const packages = placements.map((p) => p.package);
    highestPackage = Math.max(...packages);
    const sum = packages.reduce((acc, curr) => acc + curr, 0);
    averagePackage = sum / placements.length;
  }

  // Application status breakdown
  const statusBreakdown = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const applicationStats = {};
  statusBreakdown.forEach((stat) => {
    applicationStats[stat._id] = stat.count;
  });

  // Department-wise placements
  // We can group placements by student department
  const deptPlacements = await PlacementHistory.aggregate([
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'studentInfo',
      },
    },
    {
      $unwind: '$studentInfo',
    },
    {
      $group: {
        _id: '$studentInfo.department',
        placedCount: { $sum: 1 },
        averagePackage: { $avg: '$package' },
      },
    },
  ]);

  // General department statistics
  const deptStudents = await Student.aggregate([
    {
      $group: {
        _id: '$department',
        totalCount: { $sum: 1 },
      },
    },
  ]);

  const departmentWiseStats = deptStudents.map((dept) => {
    const placement = deptPlacements.find((p) => p._id === dept._id);
    const placedCount = placement ? placement.placedCount : 0;
    const avgPkg = placement ? placement.averagePackage : 0;
    return {
      department: dept._id,
      totalStudents: dept.totalCount,
      placedStudents: placedCount,
      averagePackage: parseFloat(avgPkg.toFixed(2)),
      placementPercentage: parseFloat(((placedCount / dept.totalCount) * 100).toFixed(2)),
    };
  });

  return {
    overview: {
      totalStudents,
      totalJobs,
      totalApplications,
      totalPlaced,
      placementRate: parseFloat(placementRate.toFixed(2)),
      highestPackage,
      averagePackage: parseFloat(averagePackage.toFixed(2)),
    },
    applications: applicationStats,
    departments: departmentWiseStats,
  };
};

const getCompanyStats = async (companyId) => {
  const companyJobs = await Job.find({ company: companyId });
  const jobIds = companyJobs.map((j) => j._id);

  const totalJobsPosted = companyJobs.length;
  const totalApplicationsReceived = await Application.countDocuments({
    job: { $in: jobIds },
  });

  const selectionsCount = await Application.countDocuments({
    job: { $in: jobIds },
    status: 'offered',
  });

  const interviewStats = await Interview.countDocuments({
    job: { $in: jobIds },
  });

  return {
    totalJobsPosted,
    totalApplicationsReceived,
    selectionsCount,
    interviewStats,
  };
};

export {
  getDashboardStats,
  getCompanyStats,
};
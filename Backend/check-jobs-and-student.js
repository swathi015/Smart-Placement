import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js'; 
import Company from './models/Company.js'; // Ensure Company is registered
import Student from './models/Student.js';
import Job from './models/Job.js';
import calculateEligibility from './utils/calculateEligibility.js';

const checkCriteria = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_placement';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Fetch the active student
    const student = await Student.findOne().populate('user');
    if (!student) {
      console.log('No students found in the database!');
      return;
    }

    console.log('\n--- Student Profile ---');
    console.log('Name:', student.user?.name);
    console.log('CGPA:', student.cgpa);
    console.log('Backlogs:', student.backlogs);
    console.log('Skills:', student.skills);

    // Fetch all open jobs
    const jobs = await Job.find().populate('company');
    console.log(`\nFound ${jobs.length} jobs in the database.`);

    for (const job of jobs) {
      console.log(`\n--- Job: ${job.title} at ${job.company?.companyName || 'Corporate'} ---`);
      console.log('Min CGPA required:', job.minCGPA);
      console.log('Max Backlogs allowed:', job.maxBacklogs);
      console.log('Skills Required:', job.skillsRequired);

      const eligibility = calculateEligibility(student, job);
      console.log('ELigibility Outcome:', eligibility.eligible ? '✅ ELIGIBLE' : '❌ INELIGIBLE');
      if (!eligibility.eligible) {
        console.log('Reasons:', eligibility.reasons);
      }
    }

  } catch (error) {
    console.error('Check failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkCriteria();

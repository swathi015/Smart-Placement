import { Router } from 'express';
const router = Router();
import { getStudentProfile, updateStudentProfile, getAllStudents, uploadResume, getEligibleJobs } from '../controllers/studentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

router.get('/profile', protect, authorize('student'), getStudentProfile);
router.put('/profile', protect, authorize('student'), updateStudentProfile);
router.get('/', protect, authorize('admin', 'coordinator', 'company'), getAllStudents);
router.post('/resume', protect, authorize('student'), upload.single('resume'), uploadResume);
router.get('/eligible-jobs', protect, authorize('student'), getEligibleJobs);

export default router;
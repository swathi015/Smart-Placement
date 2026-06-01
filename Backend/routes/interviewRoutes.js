import { Router } from 'express';
const router = Router();
import { scheduleInterview, getStudentInterviews, getJobInterviews, updateInterview } from '../controllers/interviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

router.post('/', protect, authorize('company', 'coordinator', 'admin'), scheduleInterview);
router.get('/my-interviews', protect, authorize('student'), getStudentInterviews);
router.get('/job/:jobId', protect, authorize('company', 'coordinator', 'admin'), getJobInterviews);
router.put('/:id', protect, authorize('company', 'coordinator', 'admin'), updateInterview);

export default router;
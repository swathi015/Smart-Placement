import { Router } from 'express';
const router = Router();
import { applyToJob, getApplicationsForJob, getStudentApplications, updateApplicationStatus } from '../controllers/applicationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

router.post('/apply/:jobId', protect, authorize('student'), applyToJob);
router.get('/job/:jobId', protect, authorize('company', 'coordinator', 'admin'), getApplicationsForJob);
router.get('/my-applications', protect, authorize('student'), getStudentApplications);
router.put('/:id/status', protect, authorize('company', 'coordinator', 'admin'), updateApplicationStatus);

export default router;
import { Router } from 'express';
const router = Router();
import { getCompanyProfile, updateCompanyProfile, getAllCompanies, postJob, getJobsPosted, updateJob } from '../controllers/companyController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

router.get('/profile', protect, authorize('company'), getCompanyProfile);
router.put('/profile', protect, authorize('company'), updateCompanyProfile);
router.get('/', protect, authorize('admin', 'coordinator'), getAllCompanies);
router.post('/jobs', protect, authorize('company'), postJob);
router.get('/jobs', protect, authorize('company'), getJobsPosted);
router.put('/jobs/:id', protect, authorize('company'), updateJob);

export default router;
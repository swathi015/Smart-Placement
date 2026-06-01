import { Router } from 'express';
const router = Router();
import { getAdminDashboardStats, getCompanyDashboardStats } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

router.get('/dashboard', protect, authorize('admin', 'coordinator'), getAdminDashboardStats);
router.get('/company', protect, authorize('company'), getCompanyDashboardStats);

export default router;
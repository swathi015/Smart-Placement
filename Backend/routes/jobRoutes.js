import { Router } from 'express';
const router = Router();
import { getAllJobs, getJobById } from '../controllers/jobController.js';
import { protect } from '../middlewares/authMiddleware.js';

router.get('/', protect, getAllJobs);
router.get('/:id', protect, getJobById);

export default router;
import { Router } from 'express';
const router = Router();
import { registerUser, loginUser, getUserProfile, getPendingUsers, approveUser } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/pending', protect, authorize('admin'), getPendingUsers);
router.put('/approve/:id', protect, authorize('admin'), approveUser);

export default router;
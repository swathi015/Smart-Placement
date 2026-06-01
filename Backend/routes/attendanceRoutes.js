import { Router } from 'express';
const router = Router();
import { recordAttendance, getAttendanceByEvent, getStudentAttendance } from '../controllers/attendanceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

router.post('/', protect, authorize('admin', 'coordinator'), recordAttendance);
router.get('/event', protect, authorize('admin', 'coordinator', 'company'), getAttendanceByEvent);
router.get('/student/:studentId', protect, getStudentAttendance);

export default router;
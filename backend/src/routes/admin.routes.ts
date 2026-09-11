import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/users', AdminController.listUsers);
router.patch('/users/:userId/status', AdminController.toggleUserStatus);
router.get('/analytics', AdminController.getAnalytics);

export default router;

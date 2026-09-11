import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { updateProfileSchema, updatePasswordSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/me', UserController.getProfile);
router.patch('/me', validateRequest(updateProfileSchema), UserController.updateProfile);
router.patch('/me/password', validateRequest(updatePasswordSchema), UserController.updatePassword);
router.get('/me/notifications', UserController.getNotifications);
router.patch('/me/notifications/read', UserController.markNotificationsRead);
router.delete('/me', UserController.deleteAccount);

export default router;

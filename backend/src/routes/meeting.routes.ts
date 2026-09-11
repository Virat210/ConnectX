import { Router } from 'express';
import { MeetingController } from '../controllers/meeting.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createMeetingSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest(createMeetingSchema), MeetingController.create);
router.get('/', MeetingController.listUserMeetings);
router.get('/:meetingId', MeetingController.getByMeetingId);
router.post('/:meetingId/end', MeetingController.endMeeting);

export default router;

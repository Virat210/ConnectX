import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { validateRequest } from '../middleware/validation';
import { supportTicketSchema } from '../validators/schemas';
import { supportLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', supportLimiter, validateRequest(supportTicketSchema), SupportController.submitTicket);

export default router;

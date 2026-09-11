import { Router } from 'express';
import { WebrtcController } from '../controllers/webrtc.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/webrtc/ice-servers
router.get('/ice-servers', optionalAuth, WebrtcController.getIceServers);

export default router;

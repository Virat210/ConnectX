import { Request, Response, NextFunction } from 'express';
import { WebrtcService } from '../services/webrtc.service';

export class WebrtcController {
  static getIceServers(req: Request, res: Response, next: NextFunction): void {
    try {
      const userId = req.user?.userId || (req.query.userId as string) || undefined;
      const iceServers = WebrtcService.getIceServers(userId);

      res.status(200).json({
        success: true,
        data: {
          iceServers,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

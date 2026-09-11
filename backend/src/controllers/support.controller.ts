import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { SupportTicket } from '../models/SupportTicket';
import { emailService } from '../services/email.service';
import { logger } from '../utils/logger';

export class SupportController {
  static async submitTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;

      const ticketId = `TKT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const ticket = await SupportTicket.create({
        ticketId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
      });

      logger.info(`New support ticket created: ${ticketId} from ${email}`);

      // Send support notification email via Resend to viratchauhan1010@gmail.com
      await emailService.sendSupportMessage({
        ticketId,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        timestamp: ticket.createdAt,
      });

      res.status(201).json({
        success: true,
        message: 'Your support ticket has been submitted. Our team will get back to you shortly.',
        data: {
          ticket: {
            ticketId: ticket.ticketId,
            subject: ticket.subject,
            status: ticket.status,
            createdAt: ticket.createdAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

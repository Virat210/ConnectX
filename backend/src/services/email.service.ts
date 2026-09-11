import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface SupportEmailData {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
}

class EmailService {
  private resend: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim() !== '') {
      this.resend = new Resend(env.RESEND_API_KEY);
      logger.info('Resend Email service initialized.');
    } else {
      logger.warn('RESEND_API_KEY not configured. Support messages will be logged locally.');
    }
  }

  async sendSupportMessage(data: SupportEmailData): Promise<boolean> {
    const formattedDate = data.timestamp.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #6366f1; margin: 0 0 8px 0; font-size: 24px;">ConnectX Helpdesk Support Request</h2>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Ticket ID: <strong style="color: #cbd5e1; font-family: monospace;">${data.ticketId}</strong></p>
        </div>

        <div style="background-color: #1e293b; padding: 18px; border-radius: 12px; margin-bottom: 20px;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="color: #94a3b8; padding: 6px 0; width: 120px;"><strong>Sender Name:</strong></td>
              <td style="color: #f1f5f9; padding: 6px 0;">${data.name}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;"><strong>Sender Email:</strong></td>
              <td style="color: #38bdf8; padding: 6px 0;"><a href="mailto:${data.email}" style="color: #38bdf8; text-decoration: none;">${data.email}</a></td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;"><strong>Subject:</strong></td>
              <td style="color: #f1f5f9; padding: 6px 0;">${data.subject}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;"><strong>Received At:</strong></td>
              <td style="color: #cbd5e1; padding: 6px 0;">${formattedDate}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #1e293b; padding: 18px; border-radius: 12px; margin-bottom: 24px;">
          <h4 style="color: #94a3b8; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Message Body:</h4>
          <p style="color: #f8fafc; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${data.message}</p>
        </div>

        <div style="border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
          <p style="margin: 0 0 4px 0;">ConnectX Video Collaboration Platform</p>
          <p style="margin: 0;">Platform Lead: <strong>Virat Singh</strong> | Email: <strong>viratchauhan1010@gmail.com</strong> | Phone: <strong>+91 8303639037</strong></p>
        </div>
      </div>
    `;

    if (this.resend) {
      try {
        const response = await this.resend.emails.send({
          from: env.RESEND_FROM_EMAIL,
          to: env.SUPPORT_EMAIL,
          replyTo: data.email,
          subject: `[ConnectX Ticket #${data.ticketId}] ${data.subject}`,
          html: htmlContent,
        });

        logger.info('Support email dispatched successfully via Resend', {
          ticketId: data.ticketId,
          emailId: response.data?.id,
          to: env.SUPPORT_EMAIL,
        });
        return true;
      } catch (err: any) {
        logger.error('Failed to dispatch email via Resend API', {
          error: err.message,
          ticketId: data.ticketId,
        });
        // Non-fatal: ticket is still persisted in database
        return false;
      }
    } else {
      logger.info('DEV MODE: Support ticket logged (Resend key not configured):', {
        ticketId: data.ticketId,
        from: data.email,
        to: env.SUPPORT_EMAIL,
        subject: data.subject,
      });
      return true;
    }
  }
}

export const emailService = new EmailService();

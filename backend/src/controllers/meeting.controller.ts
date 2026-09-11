import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Meeting } from '../models/Meeting';
import { Participant } from '../models/Participant';
import { MeetingService } from '../services/meeting.service';
import { logger } from '../utils/logger';

export class MeetingController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { title, description, scheduledAt, durationMinutes, passcode, requirePassword, meetingSettings } = req.body;

      const { meeting, shareUrl } = await MeetingService.createMeeting({
        hostId: userId,
        title,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        durationMinutes,
        passcode,
        requirePassword,
        meetingSettings,
      });

      logger.info(`Meeting created: ${meeting.meetingId} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Meeting created successfully.',
        data: {
          meeting: {
            id: meeting.meetingId,
            meetingId: meeting.meetingId,
            title: meeting.title,
            description: meeting.description,
            status: meeting.status,
            scheduledAt: meeting.scheduledAt,
            startedAt: meeting.startedAt,
            durationMinutes: meeting.durationMinutes,
            passcode: meeting.passcode,
            requirePassword: meeting.requirePassword,
            shareUrl,
            link: shareUrl,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getByMeetingId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meetingId = req.params.meetingId as string;
      const meeting = await MeetingService.getMeeting(meetingId);

      if (!meeting) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found.',
          code: 'MEETING_NOT_FOUND',
        });
        return;
      }

      if (meeting.status === 'ended') {
        res.status(410).json({
          success: false,
          message: 'This meeting has ended.',
          code: 'MEETING_ENDED',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          meeting: {
            id: meeting.meetingId,
            meetingId: meeting.meetingId,
            title: meeting.title,
            description: meeting.description,
            status: meeting.status,
            scheduledAt: meeting.scheduledAt,
            startedAt: meeting.startedAt,
            durationMinutes: meeting.durationMinutes,
            requirePassword: meeting.requirePassword,
            host: meeting.hostId,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async listUserMeetings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Find meetings hosted by user or participated in
      const hostedMeetings = await Meeting.find({
        hostId: new mongoose.Types.ObjectId(userId),
      }).sort({ createdAt: -1 }).limit(20);

      const participatedRecords = await Participant.find({
        userId: new mongoose.Types.ObjectId(userId),
      }).sort({ createdAt: -1 }).limit(20);

      const participatedMeetingIds = participatedRecords.map((p) => p.meetingId);
      const participatedMeetings = await Meeting.find({
        meetingId: { $in: participatedMeetingIds },
        hostId: { $ne: new mongoose.Types.ObjectId(userId) },
      }).sort({ createdAt: -1 }).limit(20);

      const scheduled = hostedMeetings.filter((m) => m.status === 'upcoming');
      const recent = [...hostedMeetings.filter((m) => m.status !== 'upcoming'), ...participatedMeetings];

      res.status(200).json({
        success: true,
        data: {
          scheduled: scheduled.map((m) => ({
            id: m.meetingId,
            name: m.title,
            title: m.title,
            date: m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString() : 'Scheduled',
            time: m.scheduledAt ? new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:00 AM',
            duration: `${m.durationMinutes || 45} mins`,
            durationMinutes: m.durationMinutes || 45,
            passcode: m.passcode,
            link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/meeting/${m.meetingId}`,
            status: 'Upcoming',
            participants: [],
          })),
          recent: recent.map((m) => ({
            id: m.meetingId,
            name: m.title,
            title: m.title,
            date: m.startedAt ? new Date(m.startedAt).toLocaleDateString() : 'Recent',
            isoDate: m.startedAt?.toISOString() || m.createdAt.toISOString(),
            duration: m.endedAt && m.startedAt
              ? `${Math.max(1, Math.round((m.endedAt.getTime() - m.startedAt.getTime()) / 60000))} mins`
              : `${m.durationMinutes || 30} mins`,
            durationMinutes: m.durationMinutes || 30,
            status: m.status === 'active' ? 'Active' : 'Completed',
            hasRecording: false,
            participantsCount: 1,
            participants: [],
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async endMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const meetingId = req.params.meetingId as string;

      const meeting = await MeetingService.endMeeting(meetingId, userId);
      if (!meeting) {
        res.status(404).json({
          success: false,
          message: 'Meeting not found.',
          code: 'MEETING_NOT_FOUND',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Meeting ended successfully.',
      });
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_HOST_ONLY') {
        res.status(403).json({
          success: false,
          message: 'Only the meeting host can end the meeting for everyone.',
          code: 'FORBIDDEN',
        });
        return;
      }
      next(err);
    }
  }
}

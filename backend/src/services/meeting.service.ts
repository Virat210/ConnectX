import crypto from 'crypto';
import mongoose from 'mongoose';
import { Meeting, IMeeting } from '../models/Meeting';
import { Participant } from '../models/Participant';
import { env } from '../config/env';

export class MeetingService {
  /**
   * Generates a cryptographically secure, human-friendly meeting ID
   * Example: cnx-7f2a-9b4c
   */
  static generateMeetingId(): string {
    const part1 = crypto.randomBytes(2).toString('hex');
    const part2 = crypto.randomBytes(2).toString('hex');
    return `cnx-${part1}-${part2}`;
  }

  /**
   * Creates a meeting in the database
   */
  static async createMeeting(data: {
    hostId: string;
    title?: string;
    description?: string;
    scheduledAt?: Date | null;
    durationMinutes?: number;
    passcode?: string;
    requirePassword?: boolean;
    meetingSettings?: any;
  }): Promise<{ meeting: IMeeting; shareUrl: string }> {
    let meetingId = this.generateMeetingId();

    // Ensure uniqueness
    let exists = await Meeting.findOne({ meetingId });
    while (exists) {
      meetingId = this.generateMeetingId();
      exists = await Meeting.findOne({ meetingId });
    }

    const meeting = await Meeting.create({
      meetingId,
      hostId: new mongoose.Types.ObjectId(data.hostId),
      title: data.title || 'ConnectX Meeting',
      description: data.description || '',
      status: data.scheduledAt ? 'upcoming' : 'active',
      scheduledAt: data.scheduledAt || undefined,
      durationMinutes: data.durationMinutes || 45,
      passcode: data.passcode,
      requirePassword: !!data.requirePassword,
      meetingSettings: data.meetingSettings || {
        allowChat: true,
        allowScreenShare: true,
        muteOnJoin: false,
      },
    });

    const shareUrl = `${env.FRONTEND_URL}/meeting/${meetingId}`;

    return { meeting, shareUrl };
  }

  /**
   * Validates if a meeting exists and can be joined
   */
  static async getMeeting(meetingId: string) {
    const meeting = await Meeting.findOne({ meetingId }).populate('hostId', 'name fullName email profileImage');
    return meeting;
  }

  /**
   * Ends a meeting (host only)
   */
  static async endMeeting(meetingId: string, hostId: string): Promise<IMeeting | null> {
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return null;

    if (meeting.hostId.toString() !== hostId) {
      throw new Error('FORBIDDEN_HOST_ONLY');
    }

    meeting.status = 'ended';
    meeting.endedAt = new Date();
    await meeting.save();

    // Mark all active participants as left
    await Participant.updateMany(
      { meetingId, status: 'joined' },
      { $set: { status: 'left', leftAt: new Date() } }
    );

    return meeting;
  }
}

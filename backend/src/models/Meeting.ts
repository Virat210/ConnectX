import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
  meetingId: string;
  hostId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: 'upcoming' | 'active' | 'ended';
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  passcode?: string;
  requirePassword?: boolean;
  durationMinutes?: number;
  maxParticipants?: number;
  meetingSettings?: {
    allowChat: boolean;
    allowScreenShare: boolean;
    muteOnJoin: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    meetingId: { type: String, required: true, unique: true, index: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, default: 'ConnectX Meeting' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'active', 'ended'], default: 'active', index: true },
    scheduledAt: { type: Date },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    passcode: { type: String },
    requirePassword: { type: Boolean, default: false },
    durationMinutes: { type: Number, default: 45 },
    maxParticipants: { type: Number, default: 50 },
    meetingSettings: {
      allowChat: { type: Boolean, default: true },
      allowScreenShare: { type: Boolean, default: true },
      muteOnJoin: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export const Meeting = mongoose.model<IMeeting>('Meeting', MeetingSchema);

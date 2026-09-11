import mongoose, { Document, Schema } from 'mongoose';

export interface IParticipant extends Document {
  meetingId: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  role: 'host' | 'co-host' | 'participant';
  status: 'joined' | 'left' | 'removed';
  joinedAt: Date;
  leftAt?: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    meetingId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['host', 'co-host', 'participant'], default: 'participant' },
    status: { type: String, enum: ['joined', 'left', 'removed'], default: 'joined' },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

ParticipantSchema.index({ meetingId: 1, userId: 1 });

export const Participant = mongoose.model<IParticipant>('Participant', ParticipantSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  fullName: string;
  email: string;
  passwordHash: string;
  profileImage: string;
  role: 'admin' | 'user';
  status: 'Active' | 'Blocked';
  title?: string;
  organization?: string;
  timezone?: string;
  plan?: string;
  settings?: {
    soundEffects: boolean;
    audioInput: string;
    videoInput: string;
    audioOutput: string;
    videoQuality: string;
    noiseSuppression: boolean;
    autoMuteOnJoin: boolean;
    virtualBackground: string;
  };
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' },
    title: { type: String, default: 'Member' },
    organization: { type: String, default: 'ConnectX Workspace' },
    timezone: { type: String, default: 'GMT+5:30 (India Standard Time)' },
    plan: { type: String, default: 'Enterprise Pro' },
    settings: {
      soundEffects: { type: Boolean, default: true },
      audioInput: { type: String, default: 'Default Microphone' },
      videoInput: { type: String, default: 'Integrated HD Webcam' },
      audioOutput: { type: String, default: 'Default System Speakers' },
      videoQuality: { type: String, default: '1080p' },
      noiseSuppression: { type: Boolean, default: true },
      autoMuteOnJoin: { type: Boolean, default: false },
      virtualBackground: { type: String, default: 'none' },
    },
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);

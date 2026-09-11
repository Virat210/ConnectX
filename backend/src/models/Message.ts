import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  meetingId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  messageType: 'text' | 'file';
  attachment?: {
    name: string;
    size: string;
    url?: string;
  };
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    meetingId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    messageType: { type: String, enum: ['text', 'file'], default: 'text' },
    attachment: {
      name: { type: String },
      size: { type: String },
      url: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ meetingId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);

import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { connectDB } from '../config/db';
import { Meeting } from '../models/Meeting';
import { Participant } from '../models/Participant';
import { Message } from '../models/Message';

interface RoomParticipant {
  socketId: string;
  userId: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isCoHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
}

// In-memory room state: meetingId -> Map<socketId, RoomParticipant>
const rooms = new Map<string, Map<string, RoomParticipant>>();

export function setupMeetingSockets(io: Server) {
  io.on('connection', async (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Ensure database connection is active when WebSocket connects
    try {
      await connectDB();
    } catch (dbErr: any) {
      logger.warn('Socket connect DB check warning:', dbErr.message);
    }

    // Join Meeting Room
    socket.on('meeting:join', async (data: {
      meetingId: string;
      userId: string;
      name: string;
      avatar?: string;
      isMuted?: boolean;
      isCameraOff?: boolean;
    }) => {
      try {
        const { meetingId, userId, name, avatar, isMuted = false, isCameraOff = false } = data;

        if (!meetingId || !userId) {
          socket.emit('error', { message: 'Meeting ID and User ID are required.' });
          return;
        }

        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
          socket.emit('meeting:error', { code: 'NOT_FOUND', message: 'Meeting not found.' });
          return;
        }

        if (meeting.status === 'ended') {
          socket.emit('meeting:error', { code: 'ENDED', message: 'This meeting has ended.' });
          return;
        }

        const isHost = meeting.hostId.toString() === userId;

        // Join socket room
        socket.join(meetingId);
        (socket as any).meetingId = meetingId;
        (socket as any).userId = userId;

        if (!rooms.has(meetingId)) {
          rooms.set(meetingId, new Map());
        }

        const room = rooms.get(meetingId)!;
        const participant: RoomParticipant = {
          socketId: socket.id,
          userId,
          name: name || 'Participant',
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          isHost,
          isCoHost: false,
          isMuted,
          isCameraOff,
          isSpeaking: false,
          isScreenSharing: false,
          joinedAt: new Date(),
        };

        room.set(socket.id, participant);

        // Record participant in database
        try {
          await Participant.findOneAndUpdate(
            { meetingId, userId },
            {
              $set: {
                name: participant.name,
                role: isHost ? 'host' : 'participant',
                status: 'joined',
                joinedAt: new Date(),
              },
            },
            { upsert: true, new: true }
          );
        } catch (dbErr: any) {
          logger.warn('Failed to update participant DB record:', dbErr.message);
        }

        // Send existing participants in the room to the newly joined peer
        const existingParticipants = Array.from(room.values()).filter((p) => p.socketId !== socket.id);
        socket.emit('meeting:joined', {
          self: participant,
          participants: existingParticipants,
          meeting: {
            meetingId: meeting.meetingId,
            title: meeting.title,
            isHost,
          },
        });

        // Broadcast to existing room participants that a new peer joined
        socket.to(meetingId).emit('participant:joined', participant);

        logger.info(`User ${name} (${socket.id}) joined room ${meetingId}. Total in room: ${room.size}`);
      } catch (err: any) {
        logger.error('Error in meeting:join:', err.message);
        socket.emit('meeting:error', { message: 'Failed to join meeting.' });
      }
    });

    // WebRTC Signaling: Offer
    socket.on('signal:offer', (data: { to: string; offer: any }) => {
      io.to(data.to).emit('signal:offer', {
        from: socket.id,
        offer: data.offer,
      });
    });

    // WebRTC Signaling: Answer
    socket.on('signal:answer', (data: { to: string; answer: any }) => {
      io.to(data.to).emit('signal:answer', {
        from: socket.id,
        answer: data.answer,
      });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on('signal:ice-candidate', (data: { to: string; candidate: any }) => {
      io.to(data.to).emit('signal:ice-candidate', {
        from: socket.id,
        candidate: data.candidate,
      });
    });

    // Mute / Unmute state sync
    socket.on('participant:mute', (data: { meetingId: string; isMuted: boolean }) => {
      const room = rooms.get(data.meetingId);
      if (room && room.has(socket.id)) {
        const p = room.get(socket.id)!;
        p.isMuted = data.isMuted;
        if (data.isMuted) p.isSpeaking = false;
        socket.to(data.meetingId).emit('participant:updated', {
          socketId: socket.id,
          isMuted: data.isMuted,
          isSpeaking: p.isSpeaking,
        });
      }
    });

    // Camera toggle state sync
    socket.on('participant:camera', (data: { meetingId: string; isCameraOff: boolean }) => {
      const room = rooms.get(data.meetingId);
      if (room && room.has(socket.id)) {
        const p = room.get(socket.id)!;
        p.isCameraOff = data.isCameraOff;
        socket.to(data.meetingId).emit('participant:updated', {
          socketId: socket.id,
          isCameraOff: data.isCameraOff,
        });
      }
    });

    // Speaking state indicator
    socket.on('participant:speaking', (data: { meetingId: string; isSpeaking: boolean }) => {
      const room = rooms.get(data.meetingId);
      if (room && room.has(socket.id)) {
        const p = room.get(socket.id)!;
        if (!p.isMuted) {
          p.isSpeaking = data.isSpeaking;
          socket.to(data.meetingId).emit('participant:updated', {
            socketId: socket.id,
            isSpeaking: data.isSpeaking,
          });
        }
      }
    });

    // Screen sharing start/stop
    socket.on('screen:start', (data: { meetingId: string }) => {
      const room = rooms.get(data.meetingId);
      if (room && room.has(socket.id)) {
        const p = room.get(socket.id)!;
        p.isScreenSharing = true;
        socket.to(data.meetingId).emit('screen:started', { socketId: socket.id, presenterName: p.name });
      }
    });

    socket.on('screen:stop', (data: { meetingId: string }) => {
      const room = rooms.get(data.meetingId);
      if (room && room.has(socket.id)) {
        const p = room.get(socket.id)!;
        p.isScreenSharing = false;
        socket.to(data.meetingId).emit('screen:stopped', { socketId: socket.id });
      }
    });

    // Chat messaging
    socket.on('chat:message', async (data: {
      meetingId: string;
      message: string;
      attachment?: any;
    }) => {
      try {
        const { meetingId, message, attachment } = data;
        const room = rooms.get(meetingId);
        if (!room || !room.has(socket.id)) {
          return;
        }

        const sender = room.get(socket.id)!;
        if (!message?.trim() && !attachment) return;

        // Persist message in database
        const savedMessage = await Message.create({
          meetingId,
          senderId: sender.userId,
          senderName: sender.name,
          senderAvatar: sender.avatar,
          message: message.trim(),
          attachment,
        });

        const chatPayload = {
          id: savedMessage._id.toString(),
          meetingId,
          senderId: sender.socketId,
          senderUserId: sender.userId,
          senderName: sender.name,
          senderAvatar: sender.avatar,
          content: savedMessage.message,
          attachment: savedMessage.attachment,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        // Broadcast to all participants in room including sender
        io.to(meetingId).emit('chat:message', chatPayload);
      } catch (err: any) {
        logger.error('Error saving/dispatching chat message:', err.message);
      }
    });

    // Real-time floating reactions
    socket.on('reaction:send', (data: { meetingId: string; emoji: string }) => {
      const room = rooms.get(data.meetingId);
      if (!room || !room.has(socket.id)) return;

      const sender = room.get(socket.id)!;
      io.to(data.meetingId).emit('reaction:received', {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        emoji: data.emoji,
        senderId: socket.id,
        senderName: sender.name,
        x: 25 + Math.random() * 50,
      });
    });

    // Host Moderation: Mute a specific participant
    socket.on('host:mute-participant', (data: { meetingId: string; targetSocketId: string }) => {
      const room = rooms.get(data.meetingId);
      if (!room || !room.has(socket.id)) return;

      const requester = room.get(socket.id)!;
      if (!requester.isHost && !requester.isCoHost) return;

      io.to(data.targetSocketId).emit('host:force-mute');
    });

    // Host Moderation: Remove a participant
    socket.on('host:remove-participant', (data: { meetingId: string; targetSocketId: string }) => {
      const room = rooms.get(data.meetingId);
      if (!room || !room.has(socket.id)) return;

      const requester = room.get(socket.id)!;
      if (!requester.isHost) return;

      io.to(data.targetSocketId).emit('meeting:kicked', { message: 'You have been removed by the host.' });
    });

    // Host Moderation: End meeting for everyone
    socket.on('meeting:end-all', async (data: { meetingId: string }) => {
      try {
        const room = rooms.get(data.meetingId);
        if (!room || !room.has(socket.id)) return;

        const requester = room.get(socket.id)!;
        if (!requester.isHost) return;

        // Mark meeting ended in database
        await Meeting.findOneAndUpdate(
          { meetingId: data.meetingId },
          { $set: { status: 'ended', endedAt: new Date() } }
        );

        await Participant.updateMany(
          { meetingId: data.meetingId, status: 'joined' },
          { $set: { status: 'left', leftAt: new Date() } }
        );

        io.to(data.meetingId).emit('meeting:ended', {
          message: 'The host has ended the meeting for all participants.',
        });

        rooms.delete(data.meetingId);
        logger.info(`Meeting ${data.meetingId} ended by host.`);
      } catch (err: any) {
        logger.error('Error ending meeting for everyone:', err.message);
      }
    });

    // Leave meeting
    socket.on('meeting:leave', (data: { meetingId: string }) => {
      handleSocketLeave(socket, data.meetingId);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const meetingId = (socket as any).meetingId;
      if (meetingId) {
        handleSocketLeave(socket, meetingId);
      }
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  async function handleSocketLeave(socket: Socket, meetingId: string) {
    socket.leave(meetingId);
    const room = rooms.get(meetingId);
    if (!room) return;

    if (room.has(socket.id)) {
      const participant = room.get(socket.id)!;
      room.delete(socket.id);

      // Notify others that participant left
      socket.to(meetingId).emit('participant:left', {
        socketId: socket.id,
        userId: participant.userId,
        name: participant.name,
      });

      // Update participant in DB
      try {
        await Participant.findOneAndUpdate(
          { meetingId, userId: participant.userId, status: 'joined' },
          { $set: { status: 'left', leftAt: new Date() } }
        );
      } catch (err: any) {
        logger.warn('Error updating participant on leave:', err.message);
      }

      logger.info(`Participant ${participant.name} left room ${meetingId}. Remaining: ${room.size}`);

      if (room.size === 0) {
        rooms.delete(meetingId);
      }
    }
  }
}

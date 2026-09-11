import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { setupMeetingSockets } from './sockets/meeting.socket';

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach WebRTC signaling and meeting room socket handlers
setupMeetingSockets(io);

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    server.listen(env.PORT, () => {
      logger.info(`====================================================`);
      logger.info(`🚀 ConnectX Backend Server is RUNNING`);
      logger.info(`📡 HTTP Port: ${env.PORT}`);
      logger.info(`🌐 Environment: ${env.NODE_ENV}`);
      logger.info(`👥 Developer / Owner: Virat Singh`);
      logger.info(`📧 Support Email: ${env.SUPPORT_EMAIL}`);
      logger.info(`⚡ Socket.IO WebRTC Signaling: ACTIVE`);
      logger.info(`====================================================`);
    });
  } catch (err: any) {
    logger.error('Failed to start server:', { error: err.message });
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

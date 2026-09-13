import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { setupMeetingSockets } from './sockets/meeting.socket';

const server = http.createServer(app);

const socketCorsConfig = {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://localhost:10000',
        'http://127.0.0.1:10000',
      ];
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app') ||
        (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL)) ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL && origin.includes(process.env.VERCEL_PROJECT_PRODUCTION_URL))
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
};

// Initialize Primary Socket.IO with CORS
const io = new SocketIOServer(server, socketCorsConfig);

// Attach WebRTC signaling and meeting room socket handlers
setupMeetingSockets(io);

function startServer() {
  // Single HTTP listener on env.PORT and 0.0.0.0 supplied by Render
  server.on('error', (err: any) => {
    logger.error(`HTTP server error on port ${env.PORT}:`, { error: err.message });
  });

  server.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`====================================================`);
    logger.info(`🚀 ConnectX Backend Server is RUNNING`);
    logger.info(`📡 HTTP Port: ${env.PORT}`);
    logger.info(`🌐 Environment: ${env.NODE_ENV}`);
    logger.info(`👥 Developer / Owner: Virat Singh`);
    logger.info(`📧 Support Email: ${env.SUPPORT_EMAIL}`);
    logger.info(`⚡ Socket.IO WebRTC Signaling: ACTIVE`);
    logger.info(`====================================================`);
  });

  // Connect to database in background without blocking port binding or health checks
  connectDB().catch((err: any) => {
    logger.error('Initial MongoDB connection error (will retry automatically):', { error: err.message });
  });
}

// In standalone / Docker / Render mode, start the server listener. In Vercel serverless, do not call listen()
if (process.env.VERCEL === '1') {
  connectDB().catch((err: any) => {
    logger.error('Failed to pre-connect to MongoDB on Vercel initialization:', { error: err.message });
  });
} else if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { server, io, app };
export default server;

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

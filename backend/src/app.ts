import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

import authRoutes from './routes/auth.routes';
import meetingRoutes from './routes/meeting.routes';
import userRoutes from './routes/user.routes';
import supportRoutes from './routes/support.routes';
import adminRoutes from './routes/admin.routes';
import webrtcRoutes from './routes/webrtc.routes';

const app = express();

// Trust reverse proxy (essential for Vercel, Render, and express-rate-limit client IP detection)
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow WebRTC, inline scripts, and media streams
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration supporting unified Vercel hosting, localhost dev, and separated deployments
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, same-origin fetch, server-to-server)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Route normalization for Vercel serverless function rewrites
app.use((req: Request, _res: Response, next) => {
  const matchedPath = req.headers['x-matched-path'] as string;
  if (matchedPath && matchedPath.startsWith('/api') && req.url.startsWith('/api/index')) {
    req.url = matchedPath;
  }
  next();
});

// Ensure database connection is active for serverless invocations
app.use(async (_req: Request, _res: Response, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Global API rate limiting
app.use('/api', apiLimiter);

// Health Check
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    serverless: process.env.VERCEL === '1',
  });
});

// API Route Mounts (all REST endpoints are prefixed with /api)
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webrtc', webrtcRoutes);

// Detect built frontend dist directory
const potentialDistPaths = [
  path.resolve('/app/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../../../dist'),
];
const clientDistPath = potentialDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (clientDistPath) {
  logger.info(`Frontend dist located and served from: ${clientDistPath}`);

  // Serve static assets from production build
  app.use(express.static(clientDistPath));

  // SPA fallback for client-side routing
  app.get('*', (req: Request, res: Response, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  logger.warn('Frontend dist directory not found. Backend running in API-only mode.');
}

// 404 Handler for API endpoints
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
});

// Fallback 404 Handler
app.use('*', (req: Request, res: Response) => {
  if (clientDistPath && req.method === 'GET') {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;

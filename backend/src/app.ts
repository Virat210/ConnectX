import express, { Request, Response, NextFunction } from 'express';
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

// Trust reverse proxy (essential for Render and rate limiter client IP detection)
app.set('trust proxy', 1);

// ==============================================================================
// 1. SECURITY & CORS MIDDLEWARE
// ==============================================================================
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow WebRTC, inline scripts, and media streams
    crossOriginEmbedderPolicy: false,
  })
);

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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ==============================================================================
// 2. JSON & BODY PARSER MIDDLEWARE
// ==============================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Global API rate limiting
app.use('/api', apiLimiter);

// Database check exclusively for /api routes (prevents blocking static assets/SPA)
app.use('/api', async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 3. API ROUTES (All prefixed with /api/*)
// ==============================================================================
// Health Check (supports both /api/health and /health)
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    serverless: process.env.VERCEL === '1',
  });
});

// REST API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webrtc', webrtcRoutes);

// ==============================================================================
// 4. SOCKET.IO (Handled through HTTP server in server.ts)
// Note: Handled by server.listen in server.ts; /socket.io requests bypass frontend.
// ==============================================================================

// ==============================================================================
// 5. STATIC FRONTEND FILES & SPA FALLBACK
// ==============================================================================
const candidateDistDirs = [
  path.resolve('/app/dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(__dirname, '../../../dist'),
];

const clientDistPath = candidateDistDirs.find((dir) =>
  fs.existsSync(path.join(dir, 'index.html'))
);

if (clientDistPath && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
  const indexHtmlFile = path.join(clientDistPath, 'index.html');
  logger.info(`Frontend dist located and served from: ${clientDistPath}`);

  // Serve static assets (.js, .css, images, fonts, etc.)
  app.use(express.static(clientDistPath));

  // Explicit root route: GET / returns /app/dist/index.html
  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(indexHtmlFile);
  });

  // SPA Fallback for client-side routing (Express 4 & 5 compatible middleware)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Only handle GET and HEAD requests for SPA navigation
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    // Never intercept API endpoints, Socket.IO signaling, or static asset extensions
    if (
      req.path === '/api' ||
      req.path.startsWith('/api/') ||
      req.path === '/socket.io' ||
      req.path.startsWith('/socket.io/') ||
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|map|webp|avif)$/i.test(req.path)
    ) {
      return next();
    }

    return res.sendFile(indexHtmlFile);
  });
} else {
  logger.warn('Frontend dist directory not found. Backend running in API-only mode.');
}

// ==============================================================================
// 6. JSON 404 HANDLER
// Reached only after API routes, static files, and SPA fallback have had their chance
// ==============================================================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;

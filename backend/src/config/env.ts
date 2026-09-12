import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from workspace root, backend dir, or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const resolveDefaultFrontendUrl = (): string => {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:5173';
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/connectx'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  FRONTEND_URL: z.string().default(resolveDefaultFrontendUrl),
  RESEND_API_KEY: z.string().optional().default(''),
  RESEND_FROM_EMAIL: z.string().default('onboarding@resend.dev'),
  SUPPORT_EMAIL: z.string().email().default('viratchauhan1010@gmail.com'),
  WEBRTC_STUN_SERVER: z.string().default('stun:stun.l.google.com:19302'),
  WEBRTC_TURN_SERVER: z.string().optional().default(''),
  WEBRTC_TURN_USERNAME: z.string().optional().default(''),
  WEBRTC_TURN_CREDENTIAL: z.string().optional().default(''),
  WEBRTC_TURN_SECRET: z.string().optional().default(''),
  WEBRTC_TURN_PORT: z.coerce.number().default(3478),
  WEBRTC_TURN_TLS_PORT: z.coerce.number().default(5349),
  WEBRTC_TURN_REALM: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

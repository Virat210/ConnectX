import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDB(): Promise<void> {
  // Return cached active connection if available (crucial for serverless warm invocations)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If connection is currently connecting, await until connected
  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve) => {
      mongoose.connection.once('connected', () => resolve());
    });
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    // Mask credentials in log output for production security
    const sanitizedUri = env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
    logger.info('Connected to MongoDB database successfully', { uri: sanitizedUri });
  } catch (error: any) {
    logger.error('Failed to connect to MongoDB', { error: error.message });
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', { error: err.message });
});

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  logger.error(`Error handling ${req.method} ${req.url}: ${message}`, {
    status,
    code,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status === 500 ? 'Internal server error.' : message,
    code,
  });
}

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validateRequest(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: error.errors[0]?.message || 'Invalid request payload',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
          code: 'VALIDATION_ERROR',
        });
        return;
      }
      next(error);
    }
  };
}

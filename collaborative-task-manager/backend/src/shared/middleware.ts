// backend/src/shared/middleware.ts

import { Request, Response, NextFunction } from 'express';
import { AppError, handleError } from './errors';
import { log } from './logger';

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      log.warn(message, {
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    } else {
      log.info(message);
    }
  });
  
  next();
};

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const appError = handleError(error);
  
  log.error(appError.message, error);
  
  res.status(appError.statusCode).json({
    success: false,
    error: appError.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: appError.stack,
      originalError: error.message,
    }),
  });
};

// Async handler wrapper (no try-catch needed in controllers)
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Rate limiting middleware (simple version)
export const rateLimiter = (requestsPerMinute: number = 60) => {
  const requests = new Map();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute
    
    // Clean old requests
    requests.forEach((timestamps, key) => {
      const validTimestamps = timestamps.filter((t: number) => t > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, validTimestamps);
      }
    });
    
    // Check current IP
    const ipRequests = requests.get(ip) || [];
    
    if (ipRequests.length >= requestsPerMinute) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
      });
    }
    
    ipRequests.push(now);
    requests.set(ip, ipRequests);
    
    next();
  };
};

// Validate request body middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors,
    });
    return;
  }

  // Handle known error types
  if (error.message.includes('not found')) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
    return;
  }

  if (error.message.includes('Invalid credentials') || error.message.includes('Invalid token')) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
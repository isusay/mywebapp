import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  console.error(err.stack);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    switch (prismaError.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'Resource already exists',
          error: 'DUPLICATE_RESOURCE'
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
          error: 'RESOURCE_NOT_FOUND'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Database operation failed',
          error: 'DATABASE_ERROR'
        });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'TOKEN_EXPIRED'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      data: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_SERVER_ERROR'
  });
};

export const notFoundHandler = (req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND'
  });
};
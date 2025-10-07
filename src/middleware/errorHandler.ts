import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Sequelize validation error
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map((err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value
      }))
    });
  }

  // JWT error
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
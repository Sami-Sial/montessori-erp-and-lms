import { ZodError } from 'zod';
import { env } from '../config/env.js';

/**
 * Consistent error shape:
 * { error: { code, message, details? } }
 */

export class AppError extends Error {
  constructor(code, message, statusCode = 400, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export const notFound = (req, res, next) => {
  next(new AppError('NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404));
};

export const errorHandler = (err, req, res, next) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A record with this value already exists',
        details: err.meta?.target ? { fields: err.meta.target } : null,
      },
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Record not found',
        details: null,
      },
    });
  }

  // Operational errors (thrown via AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid token', details: null },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: { code: 'TOKEN_EXPIRED', message: 'Token has expired', details: null },
    });
  }

  // Unhandled / programmer errors
  console.error('[Unhandled Error]', err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isDev ? err.message : 'An unexpected error occurred',
      details: env.isDev ? err.stack : null,
    },
  });
};

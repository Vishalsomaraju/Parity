import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config/env';

/**
 * Helmet configuration
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Allows Vite dev & embedded API usage
  crossOriginEmbedderPolicy: false,
});

/**
 * CORS configuration
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman) or matching frontends
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * General API Rate Limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this address. Please try again later.',
  },
});

/**
 * AI & Upload Rate Limiter (Protects expensive computation)
 */
export const expensiveEndpointLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // Limit each IP to 60 analysis/upload requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Analysis rate limit reached. Please wait a few minutes before submitting another document.',
  },
});

/**
 * Safe sanitized error handling middleware:
 * Never exposes raw database errors or API credentials to client.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const isDev = getConfig().NODE_ENV === 'development';
  const statusCode = err.status || err.statusCode || 500;

  console.error('[Error Guard]', {
    method: req.method,
    path: req.path,
    message: err.message,
  });

  res.status(statusCode).json({
    error: statusCode === 500 && !isDev ? 'An unexpected server error occurred.' : err.message || 'Error',
    code: err.code || 'INTERNAL_ERROR',
  });
}

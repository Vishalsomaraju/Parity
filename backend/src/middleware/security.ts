import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config/env';

/**
 * Helmet configuration
 */
/**
 * Helmet configuration:
 * Production enforces CSP, HSTS, frame protection (deny), nosniff, and strict referrer policy.
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const config = getConfig();
  const isProd = config.NODE_ENV === 'production';

  return helmet({
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'", config.FRONTEND_URL || '*', 'https://*.railway.app'],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    hsts: isProd
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
  })(req, res, next);
};

/**
 * CORS configuration
 * In development: allows localhost frontends.
 * In production: strictly restricts origins to configured FRONTEND_URL and CORS_ORIGIN (e.g. Vercel deployment).
 * credentials set to false as Parity is a stateless API with no session cookies.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Requests with no origin (curl, health checks, server-to-server) are allowed
    if (!origin) {
      return callback(null, true);
    }

    const config = getConfig();

    // In development / test, allow local development origins
    if (config.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In production, build allowed origins set from environment variables
    const allowedOrigins = new Set<string>();
    if (config.FRONTEND_URL) {
      config.FRONTEND_URL.split(',').forEach((url) => allowedOrigins.add(url.trim()));
    }
    if (config.CORS_ORIGIN) {
      config.CORS_ORIGIN.split(',').forEach((url) => allowedOrigins.add(url.trim()));
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked unauthorized origin in production: ${origin}`);
    return callback(new Error('Not allowed by CORS policy in production.'));
  },
  credentials: false,
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
 * Never exposes raw database errors, connection strings, or API credentials to client.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const isDev = getConfig().NODE_ENV === 'development';
  let statusCode = err.status || err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred.';

  // Handle entity too large (JSON body limit exceeded or oversized file)
  if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request payload exceeds the maximum allowed size limit.';
  }

  // Handle JSON syntax error
  if (err instanceof SyntaxError && 'body' in err && statusCode === 400) {
    code = 'INVALID_JSON';
    message = 'Malformed JSON body in request.';
  }

  console.error('[Error Guard]', {
    method: req.method,
    path: req.path,
    statusCode,
    code,
    message: err.message,
  });

  // Never leak credentials, DB strings, or stack traces in production
  if (statusCode === 500 && !isDev) {
    message = 'An unexpected server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    error: message,
    code,
  });
}

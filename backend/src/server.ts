import express from 'express';
import { getConfig } from './config/env';
import { securityHeaders, corsMiddleware, apiLimiter, errorHandler } from './middleware/security';
import apiRouter from './routes/api';
import { runMigrations } from './db/migrate';
import { seedBenchmarks } from './db/seed';
import { closePool } from './db/connection';

const app = express();
const config = getConfig();

// Core Middleware
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Global Rate Limiting
app.use('/api', apiLimiter);

// API Routes
app.use('/api', apiRouter);

// Central Error Handler
app.use(errorHandler);

const PORT = Number(config.PORT || process.env.PORT || 4000);

let server: any = null;

export async function startServer(): Promise<any> {
  // Initialize database schema and seeds if PostgreSQL is reachable
  try {
    await runMigrations();
    await seedBenchmarks();
  } catch (err: any) {
    console.warn('[Server] DB startup notice:', err.message);
  }

  return new Promise((resolve) => {
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`  ⚖️  PARITY API SERVER`);
      console.log(`  Tagline: Know where you stand before you sign.`);
      console.log(`  Listening on port: ${PORT}`);
      console.log(`  Environment: ${config.NODE_ENV}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
      resolve(server);
    });
  });
}

// Graceful Shutdown
async function handleShutdown(signal: string) {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await closePool();
      console.log('[Server] Database pool terminated.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  });
}

export default app;

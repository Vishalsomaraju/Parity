import request from 'supertest';
import app from '../src/server';
import { closePool } from '../src/db/connection';
import { corsMiddleware } from '../src/middleware/security';
import express from 'express';

import { resetConfigForTest } from '../src/config/env';

describe('Security Headers, CORS & Body Limits', () => {
  afterAll(async () => {
    await closePool();
    resetConfigForTest();
  });

  describe('Production Security Headers (Helmet)', () => {
    it('sets X-Content-Type-Options to nosniff', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('sets X-Frame-Options to DENY to prevent clickjacking', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });

    it('sets Referrer-Policy to strict-origin-when-cross-origin', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('CORS Configuration', () => {
    it('does not send Access-Control-Allow-Credentials: true', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');
      expect(res.headers['access-control-allow-credentials']).toBeUndefined();
    });

    it('allows requests with origin in development mode', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('blocks unauthorized origins in production mode', async () => {
      // Create an isolated express instance to test production CORS without mutating global config
      const prodApp = express();
      
      // Mock production environment for CORS check
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://user:pass@db.railway.app:5432/parity';
      process.env.FRONTEND_URL = 'https://parity.vercel.app';
      process.env.CORS_ORIGIN = 'https://custom-domain.com';
      resetConfigForTest();

      // Import fresh getConfig dynamically or test cors middleware directly
      const testCorsApp = express();
      testCorsApp.use(corsMiddleware);
      testCorsApp.get('/test', (req, res) => res.json({ ok: true }));
      testCorsApp.use((err: any, req: any, res: any, next: any) => {
        res.status(403).json({ error: err.message });
      });

      // Allowed origin
      const allowedRes = await request(testCorsApp)
        .get('/test')
        .set('Origin', 'https://parity.vercel.app');
      expect(allowedRes.status).toBe(200);
      expect(allowedRes.headers['access-control-allow-origin']).toBe('https://parity.vercel.app');

      // Unauthorized origin
      const blockedRes = await request(testCorsApp)
        .get('/test')
        .set('Origin', 'https://evil-attacker.com');
      expect(blockedRes.status).toBe(403);
      expect(blockedRes.body.error).toContain('Not allowed by CORS policy');

      // Reset environment
      process.env.NODE_ENV = 'test';
      delete process.env.DATABASE_URL;
      delete process.env.FRONTEND_URL;
      delete process.env.CORS_ORIGIN;
      resetConfigForTest();
    });
  });

  describe('Request Body Size Limits', () => {
    it('rejects JSON payloads exceeding the 256kb limit with 413 Payload Too Large', async () => {
      // Create a payload larger than 256kb (~300kb)
      const oversizedPayload = {
        question: 'x'.repeat(300 * 1024),
      };

      const res = await request(app)
        .post('/api/documents/doc_test123/questions')
        .set('Content-Type', 'application/json')
        .send(oversizedPayload);

      expect(res.status).toBe(413);
      expect(res.body.code).toBe('PAYLOAD_TOO_LARGE');
      expect(res.body.error).toContain('Request payload exceeds the maximum allowed size limit');
    });
  });
});

import { getConfig, resetConfigForTest } from '../src/config/env';
import { startServer, stopServer } from '../src/server';
import { closePool } from '../src/db/connection';
import * as migrateModule from '../src/db/migrate';
import * as seedModule from '../src/db/seed';

describe('Production Environment & Database Startup Hardening', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetConfigForTest();
  });

  afterEach(async () => {
    await stopServer();
    process.env = { ...originalEnv };
    resetConfigForTest();
    await closePool();
  });

  describe('Configuration Validation (Section 3 & 29.B)', () => {
    it('rejects startup in production if DATABASE_URL is missing', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_URL;

      expect(() => getConfig()).toThrow(/DATABASE_URL is required in production mode/);
    });

    it('rejects startup in production if DATABASE_URL points to localhost or 127.0.0.1', () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/parity';

      expect(() => getConfig()).toThrow(/cannot point to localhost in production mode/);

      resetConfigForTest();
      process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/parity';
      expect(() => getConfig()).toThrow(/cannot point to localhost in production mode/);
    });

    it('accepts valid production DATABASE_URL on external host (e.g. Railway)', () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://postgres:secretpassword@roundhouse.proxy.rlwy.net:49214/railway';

      const config = getConfig();
      expect(config.NODE_ENV).toBe('production');
      expect(config.DATABASE_URL).toBe('postgresql://postgres:secretpassword@roundhouse.proxy.rlwy.net:49214/railway');
    });

    it('allows missing DATABASE_URL in development and falls back to local fallback', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.DATABASE_URL;

      const config = getConfig();
      expect(config.NODE_ENV).toBe('development');
      expect(config.DATABASE_URL).toContain('postgresql://');
    });
  });

  describe('Production Server Startup Failure Boundary (Section 3 & 29.C)', () => {
    it('throws error and halts server startup if database migration fails in production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://postgres:secret@roundhouse.proxy.rlwy.net:49214/railway';
      resetConfigForTest();

      // Mock migration failure
      const migrateSpy = jest.spyOn(migrateModule, 'runMigrations').mockRejectedValueOnce(
        new Error('Connection terminated unexpectedly')
      );

      await expect(startServer()).rejects.toThrow(
        /Database initialization failed: DATABASE_URL is required and must be reachable in production/
      );

      migrateSpy.mockRestore();
    });

    it('throws error and halts server startup if benchmark seeding fails in production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://postgres:secret@roundhouse.proxy.rlwy.net:49214/railway';
      resetConfigForTest();

      const migrateSpy = jest.spyOn(migrateModule, 'runMigrations').mockResolvedValueOnce();
      const seedSpy = jest.spyOn(seedModule, 'seedBenchmarks').mockRejectedValueOnce(
        new Error('Unique constraint violation or unreachable host')
      );

      await expect(startServer()).rejects.toThrow(
        /Database initialization failed: DATABASE_URL is required and must be reachable in production/
      );

      migrateSpy.mockRestore();
      seedSpy.mockRestore();
    });
  });
});

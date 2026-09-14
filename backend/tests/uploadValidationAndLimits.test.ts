import request from 'supertest';
import app from '../src/server';
import { closePool } from '../src/db/connection';

describe('Upload Security & File Limits (Section 7, 8, 29.A)', () => {
  afterAll(async () => {
    await closePool();
  });

  it('accepts valid TXT file', async () => {
    const validTxt = '1. Term of Agreement\nContractor agrees to provide services for 12 months.';
    const res = await request(app)
      .post('/api/documents')
      .attach('file', Buffer.from(validTxt), 'contract.txt')
      .field('documentType', 'freelance_services');

    expect(res.status).toBe(202);
    expect(res.body.id).toBeDefined();
    expect(res.body.filename).toBe('contract.txt');
  });

  it('rejects unsupported file extension (.exe) with 400', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('file', Buffer.from('binary data'), 'malicious.exe');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Unsupported file extension');
  });

  it('rejects unsupported file extension (.sh) with 400', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('file', Buffer.from('#!/bin/bash\necho "hello"'), 'script.sh');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Unsupported file extension');
  });

  it('rejects mismatched MIME type and extension (.pdf with text/plain) with 400', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('file', Buffer.from('fake pdf content'), {
        filename: 'contract.pdf',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Mismatched file type');
  });

  it('rejects mismatched MIME type and extension (.txt with application/pdf) with 400', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('file', Buffer.from('text content'), {
        filename: 'contract.txt',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Mismatched file type');
  });

  it('rejects empty file (0 bytes) with 400', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('file', Buffer.from(''), 'empty.txt');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('empty');
  });

  it('rejects invalid documentType parameter with 400', async () => {
    const res = await request(app)
      .post('/api/documents')
      .attach('file', Buffer.from('Some text'), 'sample.txt')
      .field('documentType', 'invalid_unsupported_type');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid documentType');
  });

  it('rejects oversized files exceeding MAX_FILE_SIZE_MB cleanly with 413 and no stack trace', async () => {
    // 16MB buffer (exceeds default 15MB limit)
    const largeBuffer = Buffer.alloc(16 * 1024 * 1024);
    
    const res = await request(app)
      .post('/api/documents')
      .attach('file', largeBuffer, 'huge_file.txt');

    expect(res.status).toBe(413);
    expect(res.body.code).toBe('LIMIT_FILE_SIZE');
    expect(res.body.error).toContain('File exceeds maximum allowed size');
    expect(res.body.stack).toBeUndefined();
  });
});

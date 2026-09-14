import request from 'supertest';
import app from '../src/server';
import { closePool } from '../src/db/connection';

describe('API Integration Endpoints (Section 30)', () => {
  let createdDocId: string;

  afterAll(async () => {
    await closePool();
  });

  it('GET /api/health returns healthy or degraded status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.services).toBeDefined();
    expect(res.body.services.database).toBeDefined();
    expect(res.body.services.ai).toBeDefined();
  });

  it('GET /api/samples returns available demo samples', async () => {
    const res = await request(app).get('/api/samples');
    expect(res.status).toBe(200);
    expect(res.body.samples.length).toBeGreaterThan(0);
    expect(res.body.samples[0].key).toBe('freelance_standard');
    expect(res.body.samples[0].title).toBeDefined();
    expect(res.body.samples[0].documentType).toBe('freelance_services');
  });

  it('POST /api/documents uploads and processes document synchronously', async () => {
    const sampleText = `
INDEPENDENT SERVICES AGREEMENT
1. SCOPE OF WORK
Contractor provides software design services.
2. PAYMENT TERMS
Client pays within 30 days of invoice receipt.
3. TERMINATION
Either party may terminate upon 30 days written notice.
    `.trim();

    const uploadRes = await request(app)
      .post('/api/documents?sync=true')
      .attach('file', Buffer.from(sampleText), 'test_contract.txt')
      .field('documentType', 'freelance_services');

    expect(uploadRes.status).toBe(202);
    createdDocId = uploadRes.body.id;
    expect(createdDocId).toBeDefined();

    // Fetch document details
    const docRes = await request(app).get(`/api/documents/${createdDocId}`);
    expect(docRes.status).toBe(200);
    expect(docRes.body.clauseCount).toBeGreaterThan(0);
    expect(docRes.body.finePrint).toBeDefined();
    expect(docRes.body.obligations).toBeDefined();

    // Fetch status
    const statusRes = await request(app).get(`/api/documents/${createdDocId}/status`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBeDefined();

    // Fetch clauses
    const clausesRes = await request(app).get(`/api/documents/${createdDocId}/clauses`);
    expect(clausesRes.status).toBe(200);
    expect(clausesRes.body.length).toBeGreaterThanOrEqual(3);

    // Ask grounded question
    const qRes = await request(app)
      .post(`/api/documents/${createdDocId}/questions`)
      .send({ question: 'What are the payment terms?' });

    expect(qRes.status).toBe(200);
    expect(qRes.body.answer).toBeDefined();
    expect(qRes.body.status).toBe('grounded');
    expect(qRes.body.supportingClauseId).toBeDefined();
  });

  it('POST /api/compare compares two documents and GET /api/compare/:id retrieves result', async () => {
    // Upload a second document to compare against
    const docBText = `
CONSULTING AGREEMENT
1. SCOPE OF ENGAGEMENT
Consultant provides web development services.
2. PAYMENT
Payment net 60 days following client review.
3. TERMINATION
Company may terminate immediately at will.
    `.trim();

    const uploadResB = await request(app)
      .post('/api/documents?sync=true')
      .attach('file', Buffer.from(docBText), 'doc_b.txt')
      .field('documentType', 'freelance_services');

    expect(uploadResB.status).toBe(202);
    const docBId = uploadResB.body.id;

    // Run compare
    const compareRes = await request(app)
      .post('/api/compare')
      .send({
        documentAId: createdDocId,
        documentBId: docBId,
      });

    expect(compareRes.status).toBe(200);
    const comparisonId = compareRes.body.id;
    expect(comparisonId).toBeDefined();
    expect(compareRes.body.topics).toBeDefined();
    expect(compareRes.body.topics.length).toBeGreaterThan(0);
    expect(compareRes.body.summary).toBeDefined();

    // Retrieve comparison by ID
    const getCompareRes = await request(app).get(`/api/compare/${comparisonId}`);
    expect(getCompareRes.status).toBe(200);
    expect(getCompareRes.body.id).toBe(comparisonId);
  });

  it('rejects invalid document IDs or path traversal attempts with 400', async () => {
    const invalidIds = ['../../etc/passwd', 'doc_!@#$', 'very_long_id_'.repeat(10)];
    for (const id of invalidIds) {
      const res = await request(app).get(`/api/documents/${encodeURIComponent(id)}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid document ID format');
    }
  });

  it('returns 404 for nonexistent document ID', async () => {
    const res = await request(app).get('/api/documents/doc_nonexistent_999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Document not found');
  });

  it('returns 404 for nonexistent comparison ID', async () => {
    const res = await request(app).get('/api/compare/cmp_nonexistent_999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Comparison result not found');
  });
});

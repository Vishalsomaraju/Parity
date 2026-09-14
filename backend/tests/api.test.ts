import request from 'supertest';
import app from '../src/server';
import { closePool } from '../src/db/connection';

describe('API Integration Endpoints', () => {
  afterAll(async () => {
    await closePool();
  });

  it('GET /api/health returns healthy or degraded status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.services).toBeDefined();
  });

  it('GET /api/samples returns available demo samples', async () => {
    const res = await request(app).get('/api/samples');
    expect(res.status).toBe(200);
    expect(res.body.samples.length).toBeGreaterThan(0);
    expect(res.body.samples[0].key).toBe('freelance_standard');
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
    const docId = uploadRes.body.id;
    expect(docId).toBeDefined();

    // Fetch document details
    const docRes = await request(app).get(`/api/documents/${docId}`);
    expect(docRes.status).toBe(200);
    expect(docRes.body.clauseCount).toBeGreaterThan(0);
    expect(docRes.body.finePrint).toBeDefined();
    expect(docRes.body.obligations).toBeDefined();

    // Fetch clauses
    const clausesRes = await request(app).get(`/api/documents/${docId}/clauses`);
    expect(clausesRes.status).toBe(200);
    expect(clausesRes.body.length).toBeGreaterThanOrEqual(3);

    // Ask grounded question
    const qRes = await request(app)
      .post(`/api/documents/${docId}/questions`)
      .send({ question: 'What are the payment terms?' });

    expect(qRes.status).toBe(200);
    expect(qRes.body.answer).toBeDefined();
    expect(qRes.body.status).toBe('grounded');
    expect(qRes.body.supportingClauseId).toBeDefined();
  });
});

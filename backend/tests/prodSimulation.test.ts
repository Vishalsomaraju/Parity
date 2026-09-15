import fs from 'fs';
import path from 'path';
import request from 'supertest';
// Test against production server application
import app from '../src/server';
import { closePool } from '../src/db/connection';

describe('Production Build End-to-End Simulation (Section 42)', () => {
  let docAId: string;
  let docBId: string;
  let comparisonId: string;

  afterAll(async () => {
    await closePool();
  });

  it('Step 1: Health Check GET /api/health against production build', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('Step 2: Demo Samples GET /api/samples against production build', async () => {
    const res = await request(app).get('/api/samples');
    expect(res.status).toBe(200);
    expect(res.body.samples.length).toBeGreaterThan(0);
  });

  it('Step 3-5: Upload, extract, segment, score, synthesize, and persist Contract A', async () => {
    const aggressivePath = path.resolve(__dirname, '../../samples/freelance_aggressive.txt');
    const aggressiveBuffer = fs.readFileSync(aggressivePath);

    const uploadRes = await request(app)
      .post('/api/documents?sync=true')
      .attach('file', aggressiveBuffer, 'freelance_aggressive.txt')
      .field('documentType', 'freelance_services');

    expect(uploadRes.status).toBe(202);
    docAId = uploadRes.body.id;
    expect(docAId).toBeDefined();

    // Fetch document details
    const docRes = await request(app).get(`/api/documents/${docAId}`);
    expect(docRes.status).toBe(200);
    expect(docRes.body.clauseCount).toBeGreaterThan(0);
    expect(docRes.body.finePrint).toBeDefined();
    expect(docRes.body.obligations).toBeDefined();
    expect(docRes.body.timeline).toBeDefined();
    expect(docRes.body.keyTerms).toBeDefined();

    // Fetch clauses
    const clausesRes = await request(app).get(`/api/documents/${docAId}/clauses`);
    expect(clausesRes.status).toBe(200);
    expect(clausesRes.body.length).toBeGreaterThanOrEqual(3);
  });

  it('Step 6: Contextual Grounded Legal Q&A on Contract A', async () => {
    const qRes = await request(app)
      .post(`/api/documents/${docAId}/questions`)
      .send({ question: 'What are the payment terms and when will I get paid?' });

    expect(qRes.status).toBe(200);
    expect(qRes.body.status).toBe('grounded');
    expect(qRes.body.supportingClauseId).toBeDefined();
    expect(qRes.body.answer).toBeDefined();
    expect(qRes.body.verbatimQuote).toBeDefined();
  });

  it('Step 7: Upload and process Contract B (Standard Market)', async () => {
    const standardPath = path.resolve(__dirname, '../../samples/freelance_standard.txt');
    const standardBuffer = fs.readFileSync(standardPath);

    const uploadRes = await request(app)
      .post('/api/documents?sync=true')
      .attach('file', standardBuffer, 'freelance_standard.txt')
      .field('documentType', 'freelance_services');

    expect(uploadRes.status).toBe(202);
    docBId = uploadRes.body.id;
    expect(docBId).toBeDefined();
  });

  it('Step 8-9: Compare Contract A vs Contract B and retrieve comparison', async () => {
    const compareRes = await request(app)
      .post('/api/compare')
      .send({
        documentAId: docAId,
        documentBId: docBId,
        labelA: 'Aggressive Agency Offer',
        labelB: 'Standard Market Offer',
      });

    expect(compareRes.status).toBe(200);
    comparisonId = compareRes.body.id;
    expect(comparisonId).toBeDefined();
    expect(compareRes.body.topics.length).toBeGreaterThan(0);
    expect(compareRes.body.summary).toBeDefined();
    expect(compareRes.body.summary.totalTopicsCompared).toBe(compareRes.body.topics.length);

    // Retrieve comparison
    const getCmpRes = await request(app).get(`/api/compare/${comparisonId}`);
    expect(getCmpRes.status).toBe(200);
    expect(getCmpRes.body.id).toBe(comparisonId);
    expect(getCmpRes.body.topics.length).toBe(compareRes.body.topics.length);
  });
});

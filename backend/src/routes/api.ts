import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  DocumentType,
  ProcessingStatus,
  CompareRequestSchema,
  QARequestSchema,
  HealthResponse,
} from '@parity/shared';
import { query, queryOne, isDegradedMode } from '../db/connection';
import {
  dispatchDocumentProcessing,
  getJobProgress,
} from '../workers/processingQueue';
import { compareDocuments } from '../services/comparison/comparisonService';
import { answerContextualQuestion } from '../services/qa/qaService';
import { generateId } from '../utils/hash';
import { getConfig } from '../config/env';
import { expensiveEndpointLimiter } from '../middleware/security';

const router = express.Router();
const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  storage: multer.memoryStorage(),
});

const startTime = Date.now();

/**
 * GET /api/health
 * Deterministic, fast health check for Render / load balancers
 */
router.get('/health', (req: Request, res: Response) => {
  const config = getConfig();
  const degraded = isDegradedMode();

  const response: HealthResponse = {
    status: degraded ? 'degraded' : 'healthy',
    version: '1.0.0',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    environment: config.NODE_ENV,
    services: {
      database: degraded ? 'session_fallback' : 'connected',
      redis: 'bypassed',
      ai: config.GEMINI_API_KEY && config.GEMINI_API_KEY !== 'none'
        ? 'primary_active'
        : config.OPENAI_API_KEY
        ? 'secondary_active'
        : 'deterministic_fallback',
      worker: config.ENABLE_WORKER ? 'background_active' : 'in_process_fallback',
    },
  };

  res.json(response);
});

/**
 * POST /api/documents
 * Upload document for analysis
 */
router.post(
  '/documents',
  expensiveEndpointLimiter,
  upload.single('file'),
  async (req: Request, res: Response, next) => {
    try {
      const file = req.file;
      const documentType = (req.body.documentType as DocumentType) || DocumentType.FreelanceServices;
      const isSync = req.query.sync === 'true';

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded. Please provide a PDF, DOCX, or TXT document.' });
      }

      const documentId = generateId('doc');
      const filename = file.originalname || 'document.txt';
      const mimeType = file.mimetype || 'text/plain';

      // Insert initial record
      await query(
        `INSERT INTO documents (id, filename, document_type, status, is_demo, page_count, clause_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [documentId, filename, documentType, ProcessingStatus.Queued, false, 1, 0]
      );

      // Dispatch processing (async in background or sync)
      await dispatchDocumentProcessing(
        {
          documentId,
          filePathOrBuffer: file.buffer,
          filename,
          mimeType,
          documentType,
          isDemo: false,
        },
        isSync
      );

      res.status(202).json({
        id: documentId,
        filename,
        documentType,
        status: ProcessingStatus.Queued,
        isDemo: false,
        message: 'Document uploaded and processing initialized.',
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/documents/:id
 * Retrieve complete document summary
 */
router.get('/documents/:id', async (req: Request, res: Response, next) => {
  try {
    const doc = await queryOne<any>(`SELECT * FROM documents WHERE id = $1`, [req.params.id]);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const [clauses, finePrint, obligationsRows, timeline, keyTerms] = await Promise.all([
      query<any>(`SELECT * FROM clauses WHERE document_id = $1 ORDER BY clause_index ASC`, [doc.id]),
      query<any>(`SELECT * FROM fine_print WHERE document_id = $1 ORDER BY created_at ASC`, [doc.id]),
      query<any>(`SELECT * FROM obligations WHERE document_id = $1`, [doc.id]),
      query<any>(`SELECT * FROM timelines WHERE document_id = $1 ORDER BY relative_order ASC`, [doc.id]),
      queryOne<any>(`SELECT * FROM key_terms WHERE document_id = $1`, [doc.id]),
    ]);

    const obligations = {
      yourObligations: obligationsRows.filter((o) => o.party === 'your'),
      theirObligations: obligationsRows.filter((o) => o.party === 'their'),
    };

    res.json({
      id: doc.id,
      filename: doc.filename,
      documentType: doc.document_type,
      status: doc.status,
      isDemo: Boolean(doc.is_demo),
      pageCount: doc.page_count,
      clauseCount: doc.clause_count || clauses.length,
      uploadedAt: doc.uploaded_at,
      errorMessage: doc.error_message,
      keyTerms: keyTerms || null,
      finePrint: finePrint || [],
      obligations,
      timeline: timeline || [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/documents/:id/status
 * Check real-time processing status
 */
router.get('/documents/:id/status', async (req: Request, res: Response, next) => {
  try {
    const doc = await queryOne<any>(`SELECT status, error_message, is_demo FROM documents WHERE id = $1`, [
      req.params.id,
    ]);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const progress = getJobProgress(req.params.id);

    res.json({
      id: req.params.id,
      status: doc.status || progress.status,
      isDemo: Boolean(doc.is_demo),
      progressPercent: doc.status === ProcessingStatus.Complete ? 100 : progress.progressPercent,
      currentStep: doc.status === ProcessingStatus.Complete ? 'Analysis complete' : progress.currentStep,
      errorMessage: doc.error_message || progress.errorMessage,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/documents/:id/clauses
 * Retrieve individual clauses for document
 */
router.get('/documents/:id/clauses', async (req: Request, res: Response, next) => {
  try {
    const rows = await query<any>(`SELECT * FROM clauses WHERE document_id = $1 ORDER BY clause_index ASC`, [
      req.params.id,
    ]);

    const clauses = rows.map((r) => ({
      id: r.id,
      documentId: r.document_id,
      pageNumber: r.page_number,
      sectionTitle: r.section_title,
      clauseIndex: r.clause_index,
      clauseType: r.clause_type,
      clauseText: r.clause_text,
      contentHash: r.content_hash,
      similarityScore: r.similarity_score ? Number(r.similarity_score) : null,
      nearestBenchmarkId: r.nearest_benchmark_id,
      riskTier: r.risk_tier,
      riskExplanation: r.risk_explanation,
      plainMeaning: r.plain_meaning,
      whyItMatters: r.why_it_matters,
      reasonCodes: Array.isArray(r.reason_codes) ? r.reason_codes : [],
      evidenceStatus: r.evidence_status,
      createdAt: r.created_at,
    }));

    res.json(clauses);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/documents/:id/questions
 * Contextual grounded legal Q&A
 */
router.post('/documents/:id/questions', expensiveEndpointLimiter, async (req: Request, res: Response, next) => {
  try {
    const parseResult = QARequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Question must be between 3 and 500 characters.' });
    }

    const docClauses = await query<any>(
      `SELECT id, clause_index, clause_type, section_title, page_number, clause_text FROM clauses WHERE document_id = $1`,
      [req.params.id]
    );

    if (docClauses.length === 0) {
      return res.status(400).json({ error: 'Document has not been processed yet or has no clauses.' });
    }

    const answer = await answerContextualQuestion(
      parseResult.data.question,
      docClauses.map((c) => ({
        id: c.id,
        clauseIndex: c.clause_index,
        clauseType: c.clause_type,
        sectionTitle: c.section_title,
        pageNumber: c.page_number,
        clauseText: c.clause_text,
      }))
    );

    // Save Q&A interaction to database if connected
    try {
      await query(
        `INSERT INTO qa_interactions (id, document_id, question, answer, status, supporting_clause_id, page_number, verbatim_quote)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          generateId('qa'),
          req.params.id,
          answer.question,
          answer.answer,
          answer.status,
          answer.supportingClauseId,
          answer.pageNumber,
          answer.verbatimQuote,
        ]
      );
    } catch {
      // Non-critical audit log
    }

    res.json(answer);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/compare
 * Two-document semantic comparison
 */
router.post('/compare', expensiveEndpointLimiter, async (req: Request, res: Response, next) => {
  try {
    const parseResult = CompareRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Valid documentAId and documentBId are required.' });
    }

    const { documentAId, documentBId, labelA, labelB } = parseResult.data;

    const [clausesA, clausesB] = await Promise.all([
      query<any>(`SELECT clause_type, clause_text, clause_index FROM clauses WHERE document_id = $1`, [documentAId]),
      query<any>(`SELECT clause_type, clause_text, clause_index FROM clauses WHERE document_id = $1`, [documentBId]),
    ]);

    if (clausesA.length === 0 || clausesB.length === 0) {
      return res.status(400).json({ error: 'Both documents must be processed before comparison.' });
    }

    const comparisonResult = await compareDocuments(
      clausesA.map((c) => ({ clauseType: c.clause_type, clauseText: c.clause_text, clauseIndex: c.clause_index })),
      clausesB.map((c) => ({ clauseType: c.clause_type, clauseText: c.clause_text, clauseIndex: c.clause_index })),
      documentAId,
      documentBId,
      labelA,
      labelB
    );

    // Persist comparison result
    await query(
      `INSERT INTO comparison_results (id, document_a_id, document_b_id, label_a, label_b, is_demo, summary, topics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        comparisonResult.id,
        documentAId,
        documentBId,
        labelA,
        labelB,
        false,
        JSON.stringify(comparisonResult.summary),
        JSON.stringify(comparisonResult.topics),
      ]
    );

    res.json(comparisonResult);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/compare/:id
 * Retrieve stored comparison result
 */
router.get('/compare/:id', async (req: Request, res: Response, next) => {
  try {
    const row = await queryOne<any>(`SELECT * FROM comparison_results WHERE id = $1`, [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Comparison result not found' });
    }

    res.json({
      id: row.id,
      documentAId: row.document_a_id,
      documentBId: row.document_b_id,
      labelA: row.label_a,
      labelB: row.label_b,
      isDemo: Boolean(row.is_demo),
      summary: typeof row.summary === 'string' ? JSON.parse(row.summary) : row.summary,
      topics: typeof row.topics === 'string' ? JSON.parse(row.topics) : row.topics,
      createdAt: row.created_at,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/samples
 * List available sample files
 */
router.get('/samples', (req: Request, res: Response) => {
  const samplesDir = path.join(__dirname, '../../../samples');
  let files: string[] = [];
  try {
    if (fs.existsSync(samplesDir)) {
      files = fs.readdirSync(samplesDir).filter((f) => f.endsWith('.txt'));
    }
  } catch {}

  res.json({
    samples: [
      {
        key: 'freelance_standard',
        title: 'Freelance Agreement (Standard Market)',
        documentType: DocumentType.FreelanceServices,
        description: 'Balanced Net-30 freelance agreement with reciprocal protections.',
      },
      {
        key: 'freelance_aggressive',
        title: 'Freelance Agreement (Aggressive Agency)',
        documentType: DocumentType.FreelanceServices,
        description: 'One-sided contract with Net-90 terms, unlimited liability, and strict non-compete.',
      },
      {
        key: 'residential_lease_standard',
        title: 'Residential Lease (Balanced)',
        documentType: DocumentType.ResidentialLease,
        description: 'Standard tenant lease with 24-hr notice before entry and escrow deposit return.',
      },
      {
        key: 'residential_lease_restrictive',
        title: 'Residential Lease (High-Restriction)',
        documentType: DocumentType.ResidentialLease,
        description: 'Aggressive lease with entry without notice, fee shifts, and deposit retention.',
      },
      {
        key: 'tos_standard',
        title: 'Terms of Service (Standard SaaS)',
        documentType: DocumentType.PolicyToS,
        description: 'Consumer-protective software terms with transparent cancellation and data privacy.',
      },
      {
        key: 'tos_predatory',
        title: 'Terms of Service (Predatory Global)',
        documentType: DocumentType.PolicyToS,
        description: 'Perpetual content license, data selling, and cancel-by-mail dark patterns.',
      },
    ],
  });
});

export default router;

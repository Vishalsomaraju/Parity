import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  DocumentType,
  ProcessingStatus,
  CompareRequestSchema,
  QARequestSchema,
} from '@parity/shared';
import { query, queryOne } from '../db/connection';
import {
  dispatchDocumentProcessing,
  getJobProgress,
} from '../workers/processingQueue';
import { compareDocuments } from '../services/comparison/comparisonService';
import { answerContextualQuestion } from '../services/qa/qaService';
import { generateId } from '../utils/hash';
import { getConfig } from '../config/env';
import { expensiveEndpointLimiter } from '../middleware/security';
import { ExtractionError } from '../services/extraction/textExtractor';

const router = express.Router();
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

// Multer configured from single source of truth: MAX_FILE_SIZE_MB
const upload = multer({
  limits: {
    fileSize: (getConfig().MAX_FILE_SIZE_MB || 15) * 1024 * 1024,
  },
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Unsupported file extension: ${ext || 'none'}. Only PDF, DOCX, and TXT are supported.`));
    }

    const mime = (file.mimetype || '').toLowerCase();
    // Validate MIME/extension alignment (Section 7)
    if (ext === '.pdf' && !mime.includes('pdf') && mime !== 'application/octet-stream') {
      return cb(new Error('Mismatched file type: .pdf file must have application/pdf MIME type.'));
    }
    if (
      ext === '.docx' &&
      !mime.includes('word') &&
      !mime.includes('officedocument') &&
      !mime.includes('zip') &&
      mime !== 'application/octet-stream'
    ) {
      return cb(new Error('Mismatched file type: .docx file must have Word document MIME type.'));
    }
    if (ext === '.txt' && !mime.includes('text') && mime !== 'application/octet-stream' && mime !== '') {
      return cb(new Error('Mismatched file type: .txt file must have text/plain MIME type.'));
    }

    cb(null, true);
  },
});

const handleUploadMiddleware = (req: Request, res: Response, next: express.NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: `File exceeds maximum allowed size of ${getConfig().MAX_FILE_SIZE_MB}MB.`,
          code: 'LIMIT_FILE_SIZE',
        });
      }
      return res.status(400).json({ error: err.message, code: err.code || 'INVALID_UPLOAD' });
    }
    next();
  });
};

/**
 * GET /api/health
 * Minimal, fast health check for Render / load balancers.
 * Must return quickly with no AI calls, no DB queries, no internal details.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

/**
 * POST /api/documents
 * Upload document for analysis
 */
router.post(
  '/documents',
  expensiveEndpointLimiter,
  handleUploadMiddleware,
  async (req: Request, res: Response, next) => {
    try {
      const file = req.file;
      const rawDocType = req.body.documentType || DocumentType.FreelanceServices;
      const validDocTypes = Object.values(DocumentType);

      if (!validDocTypes.includes(rawDocType)) {
        return res.status(400).json({
          error: `Invalid documentType: '${rawDocType}'. Must be one of: ${validDocTypes.join(', ')}`,
        });
      }

      const documentType = rawDocType as DocumentType;
      const isSync = req.query.sync === 'true';

      if (!file || !file.buffer || file.buffer.length === 0) {
        return res.status(400).json({ error: 'Uploaded file is empty (0 bytes). Please provide a valid document.' });
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
      try {
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
      } catch (dispatchErr: any) {
        if (dispatchErr instanceof ExtractionError) {
          return res.status(dispatchErr.statusCode).json({ error: dispatchErr.message, code: 'EXTRACTION_ERROR' });
        }
        throw dispatchErr;
      }

      res.status(202).json({
        id: documentId,
        filename,
        documentType,
        status: isSync ? ProcessingStatus.Complete : ProcessingStatus.Queued,
        isDemo: false,
        message: 'Document uploaded and processing initialized.',
      });
    } catch (err: any) {
      if (err instanceof ExtractionError) {
        return res.status(err.statusCode).json({ error: err.message, code: 'EXTRACTION_ERROR' });
      }
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
    if (!SAFE_ID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID format.' });
    }

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
    if (!SAFE_ID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID format.' });
    }

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
    if (!SAFE_ID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID format.' });
    }

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
    if (!SAFE_ID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID format.' });
    }

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

    if (!SAFE_ID_REGEX.test(documentAId) || !SAFE_ID_REGEX.test(documentBId)) {
      return res.status(400).json({ error: 'Invalid document ID format in comparison request.' });
    }

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
    if (!SAFE_ID_REGEX.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid comparison ID format.' });
    }

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

import {
  DocumentType,
  ProcessingStatus,
  Document,
  RiskTier,
  EvidenceStatus,
} from '@parity/shared';
import { query, queryOne } from '../db/connection';
import { extractTextFromFile } from '../services/extraction/textExtractor';
import { splitDocumentIntoClauses } from '../services/segmentation/clauseSplitter';
import { scoreClauses } from '../services/scoring/scoringPipeline';
import { generateFinePrint } from '../services/synthesis/finePrintService';
import { extractObligations } from '../services/synthesis/obligationsService';
import { extractTimeline } from '../services/synthesis/timelineService';
import { extractKeyTerms } from '../services/synthesis/keyTermsService';
import { hashText } from '../utils/hash';
import { getConfig } from '../config/env';

export interface ProcessingJob {
  documentId: string;
  filePathOrBuffer: string | Buffer;
  filename: string;
  mimeType: string;
  documentType: DocumentType;
  isDemo?: boolean;
}

export interface JobProgress {
  status: ProcessingStatus;
  progressPercent: number;
  currentStep: string;
  errorMessage?: string | null;
}

// Bounded in-memory active job tracker (Section 24)
const MAX_PROGRESS_ENTRIES = 100;
const PROGRESS_TTL_MS = 10 * 60 * 1000; // 10 minutes
const jobProgressMap = new Map<string, JobProgress>();

export function clearJobProgress(): void {
  jobProgressMap.clear();
}

export function getJobProgress(documentId: string): JobProgress {
  const existing = jobProgressMap.get(documentId);
  if (existing) return existing;
  return {
    status: ProcessingStatus.Queued,
    progressPercent: 0,
    currentStep: 'Preparing document',
  };
}

export function updateJobProgress(documentId: string, progress: Partial<JobProgress>): void {
  const current = getJobProgress(documentId);
  jobProgressMap.set(documentId, { ...current, ...progress });

  // Evict oldest entries if map exceeds boundary
  if (jobProgressMap.size > MAX_PROGRESS_ENTRIES) {
    const oldestKey = jobProgressMap.keys().next().value;
    if (oldestKey) jobProgressMap.delete(oldestKey);
  }

  // If complete or failed, schedule bounded cleanup
  if (progress.status === ProcessingStatus.Complete || progress.status === ProcessingStatus.Failed) {
    const timer = setTimeout(() => {
      jobProgressMap.delete(documentId);
    }, PROGRESS_TTL_MS);
    if (timer.unref) timer.unref();
  }
}

// Concurrency protection (Section 25)
let activeJobsCount = 0;
const MAX_CONCURRENT_JOBS = 5;

export function getActiveJobsCount(): number {
  return activeJobsCount;
}

/**
 * Dispatch job:
 * If ENABLE_WORKER is true, kicks off async background processing;
 * otherwise runs synchronously.
 */
export async function dispatchDocumentProcessing(job: ProcessingJob, runSync = false): Promise<void> {
  if (activeJobsCount >= MAX_CONCURRENT_JOBS) {
    throw new Error('Server is currently processing the maximum number of concurrent documents (5). Please try again shortly.');
  }

  const config = getConfig();
  const shouldRunAsync = config.ENABLE_WORKER && !runSync;

  updateJobProgress(job.documentId, {
    status: ProcessingStatus.Queued,
    progressPercent: 5,
    currentStep: 'Queued for processing',
  });

  if (shouldRunAsync) {
    // Background execution without blocking HTTP response
    setImmediate(() => {
      processDocumentJob(job).catch((err) => {
        console.error(`[Worker] Background processing error for ${job.documentId}:`, err);
        updateJobProgress(job.documentId, {
          status: ProcessingStatus.Failed,
          progressPercent: 100,
          currentStep: 'Failed',
          errorMessage: err.message,
        });
      });
    });
  } else {
    // Synchronous execution (useful for degraded survival mode or tests)
    await processDocumentJob(job);
  }
}

/**
 * Full document processing pipeline:
 * 1. Extraction (PDF / DOCX / TXT)
 * 2. Clause Segmentation (Regex-first + LLM fallback)
 * 3. Embedding & Two-stage Benchmark Scoring Gate
 * 4. Synthesis: Fine Print, Obligations, Timeline, Key Terms
 * 5. Persistence
 */
export async function processDocumentJob(job: ProcessingJob): Promise<void> {
  const { documentId, filePathOrBuffer, filename, mimeType, documentType, isDemo } = job;
  console.log(`[Worker] Starting processing for ${documentId} (${filename})...`);
  activeJobsCount++;

  try {
    // Step 1: Text Extraction
    updateJobProgress(documentId, {
      status: ProcessingStatus.Extracting,
      progressPercent: 20,
      currentStep: 'Extracting document text and pages',
    });
    const extracted = await extractTextFromFile(filePathOrBuffer, mimeType);

    // Step 2: Clause Segmentation
    updateJobProgress(documentId, {
      status: ProcessingStatus.Segmenting,
      progressPercent: 40,
      currentStep: 'Detecting sections and structural boundaries',
    });
    const rawClauses = await splitDocumentIntoClauses(extracted.text, documentType);

    const clausesWithHash = rawClauses.map((c) => ({
      clauseIndex: c.clauseIndex,
      clauseType: c.clauseType,
      sectionTitle: c.sectionTitle,
      clauseText: c.clauseText,
      contentHash: hashText(c.clauseText),
    }));

    // Step 3: Two-Stage Benchmark Scoring Gate
    updateJobProgress(documentId, {
      status: ProcessingStatus.Analyzing,
      progressPercent: 60,
      currentStep: 'Evaluating clauses against calibrated benchmarks',
    });
    const scoredClauses = await scoreClauses(clausesWithHash, documentType);

    // Step 4: Multi-Aspect Synthesis Intelligence
    updateJobProgress(documentId, {
      status: ProcessingStatus.Analyzing,
      progressPercent: 80,
      currentStep: 'Synthesizing fine print, obligations, and deadlines',
    });

    const [finePrint, obligations, timeline, keyTerms] = await Promise.all([
      generateFinePrint(scoredClauses),
      extractObligations(scoredClauses),
      extractTimeline(scoredClauses),
      extractKeyTerms(extracted.text, scoredClauses),
    ]);

    // Step 5: Database Persistence (Transactional)
    await persistProcessedDocument({
      documentId,
      filename,
      documentType,
      isDemo: Boolean(isDemo),
      pageCount: extracted.pageCount,
      clauseCount: scoredClauses.length,
      scoredClauses,
      finePrint,
      obligations,
      timeline,
      keyTerms,
    });

    updateJobProgress(documentId, {
      status: ProcessingStatus.Complete,
      progressPercent: 100,
      currentStep: 'Analysis complete',
    });
    console.log(`[Worker] Document ${documentId} analysis successfully completed!`);
  } catch (err: any) {
    console.error(`[Worker] Job error on ${documentId}:`, err.message);
    updateJobProgress(documentId, {
      status: ProcessingStatus.Failed,
      progressPercent: 100,
      currentStep: 'Analysis failed',
      errorMessage: err.message,
    });
    try {
      await query(`UPDATE documents SET status = $1, error_message = $2 WHERE id = $3`, [
        ProcessingStatus.Failed,
        err.message,
        documentId,
      ]);
    } catch {}
    throw err;
  } finally {
    activeJobsCount = Math.max(0, activeJobsCount - 1);
  }
}

async function persistProcessedDocument(data: {
  documentId: string;
  filename: string;
  documentType: DocumentType;
  isDemo: boolean;
  pageCount: number;
  clauseCount: number;
  scoredClauses: any[];
  finePrint: any[];
  obligations: any;
  timeline: any[];
  keyTerms: any;
}): Promise<void> {
  const {
    documentId,
    filename,
    documentType,
    isDemo,
    pageCount,
    clauseCount,
    scoredClauses,
    finePrint,
    obligations,
    timeline,
    keyTerms,
  } = data;

  // Use transactions for PostgreSQL consistency (Section 26)
  await query('BEGIN');

  try {
    // 1. Insert/Update Document
    await query(
      `INSERT INTO documents (id, filename, document_type, status, is_demo, page_count, clause_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, clause_count = EXCLUDED.clause_count`,
      [documentId, filename, documentType, ProcessingStatus.Complete, isDemo, pageCount, clauseCount]
    );

    // 2. Insert Clauses
    for (const c of scoredClauses) {
      const clauseId = `cl_${documentId}_${c.clauseIndex}`;
      await query(
        `INSERT INTO clauses (
          id, document_id, page_number, section_title, clause_index, clause_type,
          clause_text, content_hash, similarity_score, risk_tier, risk_explanation,
          plain_meaning, why_it_matters, evidence_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          clauseId,
          documentId,
          1,
          c.sectionTitle || `Section ${c.clauseIndex}`,
          c.clauseIndex,
          c.clauseType,
          c.clauseText,
          c.contentHash,
          c.similarityScore,
          c.riskTier,
          c.riskExplanation,
          c.plainMeaning,
          c.whyItMatters,
          c.evidenceStatus || EvidenceStatus.Grounded,
        ]
      );
    }

    // 3. Insert Fine Print
    for (const fp of finePrint) {
      await query(
        `INSERT INTO fine_print (id, document_id, title, explanation, tier, related_clause_index, related_clause_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [fp.id, documentId, fp.title, fp.explanation, fp.tier, fp.relatedClauseIndex, fp.relatedClauseType || 'General']
      );
    }

    // 4. Insert Obligations
    for (const yo of obligations.yourObligations) {
      await query(
        `INSERT INTO obligations (id, document_id, party, description, clause_index, is_critical)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [yo.id, documentId, 'your', yo.description, yo.clauseIndex || 0, yo.isCritical]
      );
    }
    for (const to of obligations.theirObligations) {
      await query(
        `INSERT INTO obligations (id, document_id, party, description, clause_index, is_critical)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [to.id, documentId, 'their', to.description, to.clauseIndex || 0, to.isCritical]
      );
    }

    // 5. Insert Timelines
    for (const tl of timeline) {
      await query(
        `INSERT INTO timelines (id, document_id, milestone, timing, type, description, relative_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tl.id, documentId, tl.milestone, tl.timing, tl.type, tl.description, tl.relativeOrder]
      );
    }

    // 6. Insert Key Terms
    await query(
      `INSERT INTO key_terms (
        id, document_id, parties, duration, payment, notice_period, penalties, renewal, jurisdiction, deposit, important_dates
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        `kt_${documentId}`,
        documentId,
        keyTerms.parties || [],
        keyTerms.duration || null,
        keyTerms.payment || null,
        keyTerms.noticePeriod || null,
        keyTerms.penalties || null,
        keyTerms.renewal || null,
        keyTerms.jurisdiction || null,
        keyTerms.deposit || null,
        keyTerms.importantDates || [],
      ]
    );

    await query('COMMIT');
  } catch (err) {
    try {
      await query('ROLLBACK');
    } catch {}
    throw err;
  }
}

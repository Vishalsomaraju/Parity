import { Pool, PoolConfig } from 'pg';
import path from 'path';
import fs from 'fs';
import { getConfig } from '../config/env';

let pool: Pool | null = null;
let isDegradedSessionMode = false;

// Transient session storage for local/demo survival mode when PostgreSQL is detached
interface SessionDocument {
  id: string;
  filename: string;
  document_type: string;
  status: string;
  is_demo: boolean;
  page_count: number;
  clause_count: number;
  error_message?: string | null;
  uploaded_at: Date;
}

interface SessionClause {
  id: string;
  document_id: string;
  page_number: number;
  section_title?: string | null;
  clause_index: number;
  clause_type: string;
  clause_text: string;
  content_hash: string;
  similarity_score?: number | null;
  nearest_benchmark_id?: string | null;
  risk_tier?: string | null;
  risk_explanation?: string | null;
  plain_meaning?: string | null;
  why_it_matters?: string | null;
  reason_codes?: string[];
  evidence_status?: string;
  created_at: Date;
}

interface SessionFinePrint {
  id: string;
  document_id: string;
  title: string;
  explanation: string;
  tier: string;
  related_clause_index: number;
  related_clause_type?: string;
  created_at: Date;
}

interface SessionObligation {
  id: string;
  document_id: string;
  party: string;
  description: string;
  clause_index?: number;
  is_critical: boolean;
  created_at: Date;
}

interface SessionTimeline {
  id: string;
  document_id: string;
  milestone: string;
  timing: string;
  type: string;
  description: string;
  relative_order: number;
  created_at: Date;
}

interface SessionKeyTerms {
  id: string;
  document_id: string;
  parties: string[];
  duration?: string | null;
  payment?: string | null;
  notice_period?: string | null;
  penalties?: string | null;
  renewal?: string | null;
  jurisdiction?: string | null;
  deposit?: string | null;
  important_dates: string[];
}

interface SessionComparison {
  id: string;
  document_a_id: string;
  document_b_id: string;
  label_a: string;
  label_b: string;
  is_demo: boolean;
  summary: any;
  topics: any;
  created_at: Date;
}

// Session store collections
const sessionDocs = new Map<string, SessionDocument>();
const sessionClauses = new Map<string, SessionClause>();
const sessionFinePrint = new Map<string, SessionFinePrint>();
const sessionObligations = new Map<string, SessionObligation>();
const sessionTimelines = new Map<string, SessionTimeline>();
const sessionKeyTerms = new Map<string, SessionKeyTerms>();
const sessionComparisons = new Map<string, SessionComparison>();

let loadedBenchmarks: any[] | null = null;

export function loadBenchmarkSeeds(): any[] {
  if (!loadedBenchmarks) {
    try {
      const seedFile = path.join(__dirname, '../../../shared/src/seeds/benchmarks.json');
      if (fs.existsSync(seedFile)) {
        loadedBenchmarks = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
      } else {
        loadedBenchmarks = [];
      }
    } catch {
      loadedBenchmarks = [];
    }
  }
  return loadedBenchmarks || [];
}

/**
 * Get or create the PostgreSQL pool.
 */
export function getPool(): Pool {
  if (!pool) {
    const config = getConfig();
    const isSsl =
      config.NODE_ENV === 'production' ||
      config.DATABASE_URL.includes('sslmode=') ||
      config.DATABASE_URL.includes('render.com') ||
      config.DATABASE_URL.includes('neon.tech') ||
      config.DATABASE_URL.includes('supabase');

    const poolConfig: PoolConfig = {
      connectionString: config.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 3000, // Quick timeout to activate survival mode smoothly
      ...(isSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    };
    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      console.warn('[DB] PostgreSQL pool event:', err.message);
    });
  }
  return pool;
}

/**
 * Check whether database is operating in degraded session mode
 */
export function isDegradedMode(): boolean {
  return isDegradedSessionMode;
}

/**
 * Close PostgreSQL pool (for tests or graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Resilient query executor:
 * Runs parameterized SQL on PostgreSQL.
 * If PostgreSQL is unreachable, transparently transitions to degraded session mode
 * and logs an honest warning.
 */
export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  if (isDegradedSessionMode) {
    return handleDegradedSessionQuery<T>(text, params);
  }

  try {
    const client = getPool();
    const result = await client.query(text, params);
    return result.rows as T[];
  } catch (err: any) {
    const msg = err?.message || '';
    const code = err?.code || '';
    if (
      code === 'ECONNREFUSED' ||
      code === 'ETIMEDOUT' ||
      code === 'ENOTFOUND' ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('timeout') ||
      msg.includes('Connection terminated')
    ) {
      if (!isDegradedSessionMode) {
        console.warn(
          '[DB] PostgreSQL unavailable. Operating in Degraded Session Mode (session store active, no persistent vector DB).'
        );
        isDegradedSessionMode = true;
      }
      return handleDegradedSessionQuery<T>(text, params);
    }
    throw err;
  }
}

export async function queryOne<T>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Internal handler for degraded session mode.
 */
function handleDegradedSessionQuery<T>(text: string, params: unknown[] = []): T[] {
  const norm = text.replace(/\s+/g, ' ').trim();

  // INSERT INTO documents
  if (norm.startsWith('INSERT INTO documents')) {
    const [id, filename, document_type, status, is_demo, page_count, clause_count] = params as [
      string,
      string,
      string,
      string,
      boolean,
      number,
      number
    ];
    const doc: SessionDocument = {
      id,
      filename,
      document_type,
      status: status || 'queued',
      is_demo: Boolean(is_demo),
      page_count: page_count || 1,
      clause_count: clause_count || 0,
      uploaded_at: new Date(),
    };
    sessionDocs.set(id, doc);
    return [doc] as unknown as T[];
  }

  // UPDATE documents status
  if (norm.startsWith('UPDATE documents SET status = $1')) {
    const [status, id] = params as [string, string];
    const doc = sessionDocs.get(id);
    if (doc) {
      doc.status = status;
    }
    return [] as T[];
  }

  // SELECT ... FROM documents WHERE id = $1
  if (norm.includes('FROM documents WHERE id = $1')) {
    const [id] = params as [string];
    const doc = sessionDocs.get(id);
    return doc ? ([doc] as unknown as T[]) : ([] as T[]);
  }

  // INSERT INTO clauses
  if (norm.startsWith('INSERT INTO clauses')) {
    const [
      id,
      document_id,
      page_number,
      section_title,
      clause_index,
      clause_type,
      clause_text,
      content_hash,
      similarity_score,
      risk_tier,
      risk_explanation,
      plain_meaning,
      why_it_matters,
      evidence_status,
    ] = params as any[];
    const clause: SessionClause = {
      id,
      document_id,
      page_number: page_number || 1,
      section_title,
      clause_index,
      clause_type,
      clause_text,
      content_hash,
      similarity_score,
      risk_tier,
      risk_explanation,
      plain_meaning,
      why_it_matters,
      evidence_status: evidence_status || 'grounded',
      created_at: new Date(),
    };
    sessionClauses.set(id, clause);
    return [] as T[];
  }

  // SELECT ... FROM clauses WHERE document_id = $1
  if (norm.includes('FROM clauses WHERE document_id = $1')) {
    const [document_id] = params as [string];
    const list: SessionClause[] = [];
    for (const c of sessionClauses.values()) {
      if (c.document_id === document_id) {
        list.push(c);
      }
    }
    list.sort((a, b) => a.clause_index - b.clause_index);
    return list as unknown as T[];
  }

  // INSERT INTO fine_print
  if (norm.startsWith('INSERT INTO fine_print')) {
    const [id, document_id, title, explanation, tier, related_clause_index, related_clause_type] = params as any[];
    const fp: SessionFinePrint = {
      id,
      document_id,
      title,
      explanation,
      tier,
      related_clause_index,
      related_clause_type,
      created_at: new Date(),
    };
    sessionFinePrint.set(id, fp);
    return [] as T[];
  }

  // SELECT FROM fine_print
  if (norm.includes('FROM fine_print WHERE document_id = $1')) {
    const [document_id] = params as [string];
    const list = Array.from(sessionFinePrint.values()).filter((f) => f.document_id === document_id);
    return list as unknown as T[];
  }

  // INSERT INTO obligations
  if (norm.startsWith('INSERT INTO obligations')) {
    const [id, document_id, party, description, clause_index, is_critical] = params as any[];
    const ob: SessionObligation = {
      id,
      document_id,
      party,
      description,
      clause_index,
      is_critical: Boolean(is_critical),
      created_at: new Date(),
    };
    sessionObligations.set(id, ob);
    return [] as T[];
  }

  // SELECT FROM obligations
  if (norm.includes('FROM obligations WHERE document_id = $1')) {
    const [document_id] = params as [string];
    const list = Array.from(sessionObligations.values()).filter((o) => o.document_id === document_id);
    return list as unknown as T[];
  }

  // INSERT INTO timelines
  if (norm.startsWith('INSERT INTO timelines')) {
    const [id, document_id, milestone, timing, type, description, relative_order] = params as any[];
    const tl: SessionTimeline = {
      id,
      document_id,
      milestone,
      timing,
      type,
      description,
      relative_order: relative_order || 0,
      created_at: new Date(),
    };
    sessionTimelines.set(id, tl);
    return [] as T[];
  }

  // SELECT FROM timelines
  if (norm.includes('FROM timelines WHERE document_id = $1')) {
    const [document_id] = params as [string];
    const list = Array.from(sessionTimelines.values()).filter((t) => t.document_id === document_id);
    list.sort((a, b) => a.relative_order - b.relative_order);
    return list as unknown as T[];
  }

  // INSERT / SELECT key_terms
  if (norm.startsWith('INSERT INTO key_terms')) {
    const [id, document_id, parties, duration, payment, notice_period, penalties, renewal, jurisdiction, deposit, important_dates] =
      params as any[];
    const kt: SessionKeyTerms = {
      id,
      document_id,
      parties: parties || [],
      duration,
      payment,
      notice_period,
      penalties,
      renewal,
      jurisdiction,
      deposit,
      important_dates: important_dates || [],
    };
    sessionKeyTerms.set(document_id, kt);
    return [] as T[];
  }

  if (norm.includes('FROM key_terms WHERE document_id = $1')) {
    const [document_id] = params as [string];
    const kt = sessionKeyTerms.get(document_id);
    return kt ? ([kt] as unknown as T[]) : ([] as T[]);
  }

  // INSERT / SELECT comparison_results
  if (norm.startsWith('INSERT INTO comparison_results')) {
    const [id, document_a_id, document_b_id, label_a, label_b, is_demo, summary, topics] = params as any[];
    const cr: SessionComparison = {
      id,
      document_a_id,
      document_b_id,
      label_a,
      label_b,
      is_demo: Boolean(is_demo),
      summary,
      topics,
      created_at: new Date(),
    };
    sessionComparisons.set(id, cr);
    return [] as T[];
  }

  if (norm.includes('FROM comparison_results WHERE id = $1')) {
    const [id] = params as [string];
    const cr = sessionComparisons.get(id);
    return cr ? ([cr] as unknown as T[]) : ([] as T[]);
  }

  // Benchmark fallback search
  if (norm.includes('FROM benchmark_clauses')) {
    const benchmarks = loadBenchmarkSeeds();
    const docType = (params[0] as string) || 'freelance_services';
    const filtered = benchmarks.filter((b: any) => b.documentType === docType);
    return filtered.map((b: any, i: number) => ({
      id: `benchmark-${i + 1}`,
      document_type: b.documentType,
      clause_type: b.clauseType,
      reference_text: b.referenceText,
      plain_language_meaning: b.plainLanguageMeaning,
      source_attribution: b.sourceAttribution,
      similarity: 0.85,
    })) as unknown as T[];
  }

  return [] as T[];
}

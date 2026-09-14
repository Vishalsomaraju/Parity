import { z } from 'zod';
import { ClauseType, DocumentType, RiskTier, EvidenceStatus } from '@parity/shared';
import { getConfig } from '../../config/env';
import { query, loadBenchmarkSeeds } from '../../db/connection';
import { generateEmbedding, cosineSimilarity } from '../embeddings/embeddingService';
import { executeStructuredAI } from '../ai/aiOrchestrator';
import { truncateForLog } from '../../utils/sanitize';

export interface ScoredClauseResult {
  clauseIndex: number;
  clauseType: ClauseType;
  sectionTitle?: string;
  clauseText: string;
  contentHash: string;
  similarityScore: number;
  nearestBenchmarkId: string | null;
  nearestBenchmarkText: string | null;
  riskTier: RiskTier;
  riskExplanation: string;
  plainMeaning: string;
  whyItMatters: string;
  reasonCodes: string[];
  evidenceStatus: EvidenceStatus;
}

interface BenchmarkMatch {
  id: string;
  clauseType: ClauseType;
  referenceText: string;
  plainLanguageMeaning: string;
  similarity: number;
}

/**
 * Score clauses using the two-stage gate:
 * Stage 1: Cosine similarity against benchmark corpus.
 * Stage 2:
 *   - Below SIMILARITY_THRESHOLD -> Deterministic conservative assessment (Worth a Second Look).
 *   - At/above SIMILARITY_THRESHOLD -> LLM judgment.
 */
export async function scoreClauses(
  clauses: Array<{
    clauseIndex: number;
    clauseType: ClauseType;
    sectionTitle?: string;
    clauseText: string;
    contentHash: string;
  }>,
  documentType: DocumentType
): Promise<ScoredClauseResult[]> {
  const config = getConfig();
  const threshold = config.SIMILARITY_THRESHOLD;
  const scored: ScoredClauseResult[] = [];

  // 1. Fetch benchmark corpus
  const benchmarks = await getBenchmarksForDocType(documentType);

  // 2. Perform vector embeddings and Stage 1 cosine similarity matching
  const clausesWithMatches: Array<{
    clause: (typeof clauses)[0];
    bestMatch: BenchmarkMatch | null;
    similarity: number;
  }> = [];

  for (const c of clauses) {
    const embedding = await generateEmbedding(c.clauseText);
    const bestMatch = findBestBenchmark(embedding, c.clauseType, benchmarks);
    clausesWithMatches.push({
      clause: c,
      bestMatch,
      similarity: bestMatch ? bestMatch.similarity : 0,
    });
  }

  // 3. Partition by similarity threshold
  const clausesForLLM: Array<(typeof clausesWithMatches)[0]> = [];

  for (const item of clausesWithMatches) {
    if (!item.bestMatch || item.similarity < threshold) {
      // Below threshold: Conservative assessment (never "Fair/Safe", at least "Worth a Second Look")
      const conservative = evaluateClauseHeuristically(item.clause.clauseText, item.clause.clauseType);
      const tier = conservative.tier === RiskTier.RedFlag ? RiskTier.RedFlag : RiskTier.WorthASecondLook;

      console.log(
        `[Scoring] Clause ${item.clause.clauseIndex} similarity ${item.similarity.toFixed(2)} < threshold ${threshold}. Conservative assessment: ${tier}.`
      );

      scored.push({
        clauseIndex: item.clause.clauseIndex,
        clauseType: item.clause.clauseType,
        sectionTitle: item.clause.sectionTitle,
        clauseText: item.clause.clauseText,
        contentHash: item.clause.contentHash,
        similarityScore: item.similarity,
        nearestBenchmarkId: item.bestMatch?.id || null,
        nearestBenchmarkText: item.bestMatch?.referenceText || null,
        riskTier: tier,
        riskExplanation:
          tier === RiskTier.RedFlag
            ? conservative.explanation
            : 'This clause deviates from typical market-standard wording for this topic. Review carefully to verify obligations.',
        plainMeaning: conservative.plainMeaning,
        whyItMatters: conservative.whyItMatters,
        reasonCodes: conservative.reasonCodes.length > 0 ? conservative.reasonCodes : ['NON_STANDARD_LANGUAGE'],
        evidenceStatus: EvidenceStatus.Grounded,
      });
    } else {
      clausesForLLM.push(item);
    }
  }

  // 4. Batch LLM judgment for clauses above threshold
  if (clausesForLLM.length > 0) {
    const batchJudgments = await runBatchedJudgment(clausesForLLM, documentType);
    for (let i = 0; i < clausesForLLM.length; i++) {
      const item = clausesForLLM[i];
      const judgment = batchJudgments[i];

      scored.push({
        clauseIndex: item.clause.clauseIndex,
        clauseType: item.clause.clauseType,
        sectionTitle: item.clause.sectionTitle,
        clauseText: item.clause.clauseText,
        contentHash: item.clause.contentHash,
        similarityScore: item.similarity,
        nearestBenchmarkId: item.bestMatch?.id || null,
        nearestBenchmarkText: item.bestMatch?.referenceText || null,
        riskTier: judgment.tier,
        riskExplanation: judgment.explanation,
        plainMeaning: judgment.plainMeaning || item.bestMatch?.plainLanguageMeaning || 'Terms governing this section.',
        whyItMatters: judgment.whyItMatters || 'Determines party obligations and liability limits under this agreement.',
        reasonCodes: judgment.reasonCodes || [],
        evidenceStatus: EvidenceStatus.Grounded,
      });
    }
  }

  // Sort back into document order
  scored.sort((a, b) => a.clauseIndex - b.clauseIndex);
  return scored;
}

/**
 * Retrieve benchmarks for document type (Postgres or Seed fallback)
 */
async function getBenchmarksForDocType(documentType: DocumentType): Promise<BenchmarkMatch[]> {
  try {
    const rows = await query<any>(
      `SELECT id, clause_type, reference_text, plain_language_meaning FROM benchmark_clauses WHERE document_type = $1`,
      [documentType]
    );
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        clauseType: r.clause_type,
        referenceText: r.reference_text,
        plainLanguageMeaning: r.plain_language_meaning,
        similarity: 0,
      }));
    }
  } catch (err: any) {
    // Degrade to seeds
  }

  const seeds = loadBenchmarkSeeds();
  const filtered = seeds.filter((s: any) => s.documentType === documentType);
  return filtered.map((s: any, idx: number) => ({
    id: `seed-${documentType}-${idx + 1}`,
    clauseType: s.clauseType,
    referenceText: s.referenceText,
    plainLanguageMeaning: s.plainLanguageMeaning,
    similarity: 0,
  }));
}

/**
 * Find best benchmark match for a clause based on type preference & vector similarity
 */
function findBestBenchmark(
  clauseEmbedding: number[],
  clauseType: ClauseType,
  benchmarks: BenchmarkMatch[]
): BenchmarkMatch | null {
  if (benchmarks.length === 0) return null;

  // Filter first for matching clause type if available
  const sameTypeBenchmarks = benchmarks.filter((b) => b.clauseType === clauseType);
  const candidates = sameTypeBenchmarks.length > 0 ? sameTypeBenchmarks : benchmarks;

  let bestMatch: BenchmarkMatch | null = null;
  let highestSim = -1;

  for (const b of candidates) {
    // Compute pseudo embedding or cosine match
    const bEmbedding = generateEmbeddingSync(b.referenceText);
    const sim = cosineSimilarity(clauseEmbedding, bEmbedding);

    if (sim > highestSim) {
      highestSim = sim;
      bestMatch = { ...b, similarity: sim };
    }
  }

  return bestMatch;
}

function generateEmbeddingSync(text: string): number[] {
  // Use fast deterministic generator for benchmark vectors
  const { generateDeterministicVector } = require('../embeddings/embeddingService');
  return generateDeterministicVector(text, 768);
}

/**
 * Batched LLM Judgment Prompt (Section 16 specification)
 */
async function runBatchedJudgment(
  items: Array<{
    clause: { clauseIndex: number; clauseType: ClauseType; clauseText: string };
    bestMatch: BenchmarkMatch | null;
    similarity: number;
  }>,
  documentType: DocumentType
): Promise<Array<{ tier: RiskTier; explanation: string; plainMeaning?: string; whyItMatters?: string; reasonCodes: string[] }>> {
  const systemPrompt = `You are Parity, and you explain contract language in plain English for people without legal training.

This is plain-language information, not legal advice. Parity doesn't represent you and nothing here replaces a licensed attorney before you sign anything binding.

You compare a clause someone is being asked to sign against a fair, market-standard version of that same clause, and say plainly whether the difference actually matters.

Be direct about real problems. Don't manufacture alarm over trivial wording differences — a signer who gets three false alarms stops trusting the one real one.

Respond with valid JSON only.`;

  const clausesPayload = items.map((it) => ({
    clauseIndex: it.clause.clauseIndex,
    clauseType: it.clause.clauseType,
    clauseText: truncateForLog(it.clause.clauseText, 600),
    marketStandard: truncateForLog(it.bestMatch?.referenceText || '', 400),
  }));

  const userPrompt = `Compare these clauses against their market-standard benchmarks:
${JSON.stringify(clausesPayload, null, 2)}

Return a JSON object:
{
  "judgments": [
    {
      "clauseIndex": <number>,
      "tier": "Fair" | "Worth a Second Look" | "Red Flag",
      "explanation": "2-4 plain-language sentences on what's different and what it actually means for the person signing. No legal jargon.",
      "plainMeaning": "1 sentence summarizing what the clause says in simple terms.",
      "whyItMatters": "1 sentence on the practical impact.",
      "reasonCodes": ["short machine-readable reasons like UNILATERAL_INDEMNITY, OPEN_ENDED_LIABILITY, UNBALANCED_TERMINATION"]
    }
  ]
}

Tier guide:
- Fair: no meaningful disadvantage versus the benchmark.
- Worth a Second Look: shifts risk or obligation toward the signer, but within a range common in real contracts.
- Red Flag: removes standard protection, makes an obligation one-sided, or exposes signer to open-ended cost or liability.`;

  const BatchSchema = z.object({
    judgments: z.array(
      z.object({
        clauseIndex: z.number(),
        tier: z.nativeEnum(RiskTier),
        explanation: z.string(),
        plainMeaning: z.string().optional(),
        whyItMatters: z.string().optional(),
        reasonCodes: z.array(z.string()).default([]),
      })
    ),
  });

  const result = await executeStructuredAI({
    systemPrompt,
    userPrompt,
    schema: BatchSchema,
    deterministicFallback: () => ({
      judgments: items.map((it) => evaluateClauseHeuristically(it.clause.clauseText, it.clause.clauseType)),
    }),
  });

  const map = new Map<number, any>();
  result.data.judgments.forEach((j) => map.set(j.clauseIndex, j));

  return items.map((it) => {
    const found = map.get(it.clause.clauseIndex);
    if (found) return found;
    return evaluateClauseHeuristically(it.clause.clauseText, it.clause.clauseType);
  });
}

/**
 * Deterministic Heuristic Risk Evaluator for Fallback
 */
export function evaluateClauseHeuristically(
  clauseText: string,
  clauseType: ClauseType
): { clauseIndex: number; tier: RiskTier; explanation: string; plainMeaning: string; whyItMatters: string; reasonCodes: string[] } {
  const lower = clauseText.toLowerCase();

  // Red Flag Patterns
  if (
    lower.includes('unlimited liability') ||
    lower.includes('forfeits all accrued') ||
    lower.includes('without limitation') ||
    lower.includes('sole discretion') ||
    lower.includes('at any time without notice') ||
    lower.includes('as-is condition') ||
    lower.includes('irrevocable, perpetual') ||
    lower.includes('all worldwide right, title, interest') ||
    lower.includes('prior to receipt of payment') ||
    lower.includes('shall bear all filing fees') ||
    (lower.includes('indemnif') && lower.includes('unilateral'))
  ) {
    return {
      clauseIndex: 0,
      tier: RiskTier.RedFlag,
      explanation:
        'This clause removes a standard legal protection or creates an open-ended obligation heavily favoring the other party.',
      plainMeaning: `Terms imposing one-sided obligations regarding ${clauseType.toLowerCase()}.`,
      whyItMatters: 'Could expose you to unrestricted liabilities or forfeiture of rights before payment.',
      reasonCodes: ['UNBALANCED_TERMS', 'OPEN_ENDED_LIABILITY'],
    };
  }

  // Worth a Second Look Patterns
  if (
    lower.includes('60 days') ||
    lower.includes('90 days') ||
    lower.includes('net-60') ||
    lower.includes('net-90') ||
    lower.includes('non-compete') ||
    lower.includes('smart sensor') ||
    lower.includes('arbitration in') ||
    lower.includes('withhold') ||
    lower.includes('late charge of')
  ) {
    return {
      clauseIndex: 0,
      tier: RiskTier.WorthASecondLook,
      explanation:
        'This clause shifts some operational burden or timeline toward you, but remains within clauses commonly observed in commercial agreements.',
      plainMeaning: `Terms requiring careful scheduling or compliance for ${clauseType.toLowerCase()}.`,
      whyItMatters: 'Requires awareness of extended payment timelines or stricter notice windows.',
      reasonCodes: ['STRICT_TIMELINE', 'BURDEN_SHIFT'],
    };
  }

  // Otherwise Fair
  return {
    clauseIndex: 0,
    tier: RiskTier.Fair,
    explanation: 'This clause is balanced and follows standard market conventions without unusual signer disadvantage.',
    plainMeaning: `Standard mutual terms governing ${clauseType.toLowerCase()}.`,
    whyItMatters: 'Provides standard protections and expectations for both parties.',
    reasonCodes: ['MARKET_STANDARD'],
  };
}

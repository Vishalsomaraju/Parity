import { z } from 'zod';
import {
  ClauseType,
  ComparisonVerdict,
  SignificanceTier,
  ComparisonTopic,
  ComparisonResult,
  ALL_CLAUSE_TYPES,
} from '@parity/shared';
import { executeStructuredAI } from '../ai/aiOrchestrator';
import { truncateForLog } from '../../utils/sanitize';

export interface DocumentClauseInput {
  clauseType: ClauseType;
  clauseText: string;
  clauseIndex: number;
}

/**
 * Compare Document A and Document B topic by topic using semantic alignment.
 */
export async function compareDocuments(
  docAClauses: DocumentClauseInput[],
  docBClauses: DocumentClauseInput[],
  docAId: string,
  docBId: string,
  labelA = 'Document A',
  labelB = 'Document B',
  isDemo = false
): Promise<ComparisonResult> {
  // 1. Group clauses by the 20 canonical semantic topics
  const mapA = new Map<ClauseType, DocumentClauseInput>();
  const mapB = new Map<ClauseType, DocumentClauseInput>();

  for (const c of docAClauses) {
    if (!mapA.has(c.clauseType) || c.clauseText.length > (mapA.get(c.clauseType)?.clauseText.length || 0)) {
      mapA.set(c.clauseType, c);
    }
  }

  for (const c of docBClauses) {
    if (!mapB.has(c.clauseType) || c.clauseText.length > (mapB.get(c.clauseType)?.clauseText.length || 0)) {
      mapB.set(c.clauseType, c);
    }
  }

  // 2. Identify all topics present in either document
  const activeTopics: ClauseType[] = [];
  for (const t of ALL_CLAUSE_TYPES) {
    if (mapA.has(t) || mapB.has(t)) {
      activeTopics.push(t);
    }
  }

  // If no topics matched, default to general
  if (activeTopics.length === 0) {
    activeTopics.push(ClauseType.General);
  }

  // 3. Build payload for structured comparison
  const topicsPayload = activeTopics.map((topic) => ({
    topic,
    docAText: mapA.get(topic)?.clauseText || null,
    docBText: mapB.get(topic)?.clauseText || null,
  }));

  // 4. Run LLM Comparison Prompt (Section 18 specification)
  const systemPrompt = `You are Parity's comparison assistant. Someone is deciding between two documents — two job offers, two leases, two policies, or two agreements — and wants to know, topic by topic, which one is better for them and by how much.

This is plain-language information, not legal advice. Parity doesn't represent you and nothing here replaces a licensed attorney before you sign anything binding.

Align clauses by what they're actually about, not by section number or heading wording, since the two documents won't be structured the same way.

When a topic appears in only one document, say so explicitly. A protection that is simply missing from one document is itself a finding, not a gap to skip past.

Respond with valid JSON only.`;

  const userPrompt = `DOCUMENT A (${labelA}) and DOCUMENT B (${labelB}) topics:
${JSON.stringify(topicsPayload, null, 2)}

Return a JSON object:
{
  "topics": [
    {
      "topic": "clause type",
      "verdict": "A better" | "B better" | "equivalent" | "only in A" | "only in B",
      "explanation": "1-3 plain-language sentences on why, and what it means in practice for whoever signs.",
      "significance": "low" | "medium" | "high",
      "keyDifference": "One short headline sentence summarizing the change."
    }
  ]
}`;

  const CompareSchema = z.object({
    topics: z.array(
      z.object({
        topic: z.string(),
        verdict: z.nativeEnum(ComparisonVerdict),
        explanation: z.string(),
        significance: z.nativeEnum(SignificanceTier),
        keyDifference: z.string().optional(),
      })
    ),
  });

  const result = await executeStructuredAI({
    systemPrompt,
    userPrompt,
    schema: CompareSchema,
    deterministicFallback: () => ({
      topics: topicsPayload.map((t) => evaluateTopicHeuristically(t.topic, t.docAText, t.docBText)),
    }),
  });

  // Map results to final ComparisonTopic array
  const aiTopicMap = new Map<string, any>();
  result.data.topics.forEach((t) => aiTopicMap.set(t.topic, t));

  const comparisonTopics: ComparisonTopic[] = topicsPayload.map((item) => {
    const aiEval = aiTopicMap.get(item.topic) || evaluateTopicHeuristically(item.topic, item.docAText, item.docBText);

    return {
      topic: item.topic,
      docAText: item.docAText,
      docBText: item.docBText,
      verdict: aiEval.verdict,
      explanation: aiEval.explanation,
      significance: aiEval.significance,
      keyDifference: aiEval.keyDifference || generateKeyDiffSummary(item.docAText, item.docBText, aiEval.verdict),
    };
  });

  // 5. Calculate scorecard tallies (Honest qualitative counts, no fake 100-point score)
  let aStrongerCount = 0;
  let bStrongerCount = 0;
  let equivalentCount = 0;
  let missingProtectionCount = 0;

  for (const t of comparisonTopics) {
    if (t.verdict === ComparisonVerdict.ABetter) aStrongerCount++;
    else if (t.verdict === ComparisonVerdict.BBetter) bStrongerCount++;
    else if (t.verdict === ComparisonVerdict.Equivalent) equivalentCount++;
    else if (t.verdict === ComparisonVerdict.OnlyInA || t.verdict === ComparisonVerdict.OnlyInB) {
      missingProtectionCount++;
    }
  }

  const comparisonResult: ComparisonResult = {
    id: `cmp_${Date.now()}`,
    documentAId: docAId,
    documentBId: docBId,
    labelA,
    labelB,
    isDemo,
    createdAt: new Date().toISOString(),
    summary: {
      aStrongerCount,
      bStrongerCount,
      equivalentCount,
      missingProtectionCount,
      totalTopicsCompared: comparisonTopics.length,
    },
    topics: comparisonTopics,
  };

  return comparisonResult;
}

/**
 * Deterministic Heuristic Comparison Evaluator for Fallback
 */
export function evaluateTopicHeuristically(
  topic: ClauseType,
  docAText: string | null,
  docBText: string | null
): {
  topic: string;
  verdict: ComparisonVerdict;
  explanation: string;
  significance: SignificanceTier;
  keyDifference: string;
} {
  if (docAText && !docBText) {
    return {
      topic,
      verdict: ComparisonVerdict.OnlyInA,
      explanation: `This topic is explicitly protected in Document A but entirely omitted from Document B, leaving this area unregulated.`,
      significance: SignificanceTier.Medium,
      keyDifference: 'Protection only exists in Document A.',
    };
  }

  if (!docAText && docBText) {
    return {
      topic,
      verdict: ComparisonVerdict.OnlyInB,
      explanation: `Document B includes specific terms for this topic, while Document A is silent.`,
      significance: SignificanceTier.Medium,
      keyDifference: 'Present only in Document B.',
    };
  }

  const textA = (docAText || '').toLowerCase();
  const textB = (docBText || '').toLowerCase();

  const has90Days = (t: string) => /90\s*days|ninety/i.test(t);
  const has30Days = (t: string) => /30\s*days|thirty/i.test(t);

  // Check for obvious red flag keywords in B that aren't in A
  const redFlagsInB =
    (textB.includes('unlimited liability') && !textA.includes('unlimited liability')) ||
    (has90Days(textB) && has30Days(textA)) ||
    (textB.includes('without notice') && !textA.includes('without notice')) ||
    (textB.includes('forfeits') && !textA.includes('forfeits')) ||
    (textB.includes('non-compete') && !textA.includes('non-compete'));

  if (redFlagsInB) {
    return {
      topic,
      verdict: ComparisonVerdict.ABetter,
      explanation: `Document A provides more standard protections, whereas Document B shifts substantial liability or restriction to the signer.`,
      significance: SignificanceTier.High,
      keyDifference: 'Document A is more favorable and less restrictive for the signer.',
    };
  }

  // Check for obvious red flag keywords in A that aren't in B
  const redFlagsInA =
    (textA.includes('unlimited liability') && !textB.includes('unlimited liability')) ||
    (textA.includes('90 days') && textB.includes('30 days')) ||
    (textA.includes('without notice') && !textB.includes('without notice')) ||
    (textA.includes('forfeits') && !textB.includes('forfeits')) ||
    (textA.includes('non-compete') && !textB.includes('non-compete'));

  if (redFlagsInA) {
    return {
      topic,
      verdict: ComparisonVerdict.BBetter,
      explanation: `Document B is noticeably more balanced and protective of the signer than Document A on this topic.`,
      significance: SignificanceTier.High,
      keyDifference: 'Document B is more favorable and protects the signer better.',
    };
  }

  // Otherwise equivalent
  return {
    topic,
    verdict: ComparisonVerdict.Equivalent,
    explanation: `Both documents provide comparable terms regarding ${topic.toLowerCase()} without major disadvantages between them.`,
    significance: SignificanceTier.Low,
    keyDifference: 'Terms are materially equivalent.',
  };
}

function generateKeyDiffSummary(textA: string | null, textB: string | null, verdict: ComparisonVerdict): string {
  if (verdict === ComparisonVerdict.OnlyInA) return 'Covered only in Document A.';
  if (verdict === ComparisonVerdict.OnlyInB) return 'Covered only in Document B.';
  if (verdict === ComparisonVerdict.ABetter) return 'Document A is more protective for the signer.';
  if (verdict === ComparisonVerdict.BBetter) return 'Document B is more protective for the signer.';
  return 'Materially equivalent terms.';
}

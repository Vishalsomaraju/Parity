import { z } from 'zod';
import { QAResponse, EvidenceStatus, ClauseType } from '@parity/shared';
import { executeStructuredAI } from '../ai/aiOrchestrator';
import { cosineSimilarity, generateDeterministicVector } from '../embeddings/embeddingService';

export interface ClauseContext {
  id: string;
  clauseIndex: number;
  clauseType: ClauseType;
  sectionTitle?: string;
  pageNumber: number;
  clauseText: string;
}

/**
 * Grounded Legal Document Q&A Service
 * Strict anti-hallucination policy:
 * - Cites exact clause, page number, and verbatim excerpt.
 * - Explicitly returns 'insufficient_evidence' if the document does not contain an answer.
 */
export async function answerContextualQuestion(
  question: string,
  clauses: ClauseContext[]
): Promise<QAResponse> {
  const cleanQ = question.trim();

  // 1. Semantic retrieval of top candidate clauses
  const questionVector = generateDeterministicVector(cleanQ, 768);
  const scoredClauses = clauses.map((c) => {
    const clauseVector = generateDeterministicVector(c.clauseText, 768);
    const sim = cosineSimilarity(questionVector, clauseVector);
    return { clause: c, similarity: sim };
  });

  scoredClauses.sort((a, b) => b.similarity - a.similarity);
  const topCandidates = scoredClauses.slice(0, 3);
  const bestCandidate = topCandidates[0];

  // If even the best match is virtually zero similarity, trigger insufficient evidence immediately
  if (!bestCandidate || bestCandidate.similarity < 0.05) {
    return {
      question: cleanQ,
      answer: "I couldn't find any section in this document that addresses this question.",
      status: EvidenceStatus.InsufficientEvidence,
      supportingClauseId: null,
      supportingClauseType: null,
      pageNumber: null,
      verbatimQuote: null,
      limitationNote: 'This topic appears to be completely omitted from the provided contract text.',
    };
  }

  // 2. Query AI with candidate clause context
  const systemPrompt = `You are Parity's grounded legal assistant. You answer user questions about a contract strictly and solely based on the provided clauses.

CRITICAL RULES:
1. Work ONLY from the provided text. Never invent statutes, legal doctrines, outside facts, or terms that are not explicitly written.
2. If the clauses do NOT provide sufficient evidence to answer the question, set "status" to "insufficient_evidence" and say plainly: "I couldn't find a clause in this document that answers this clearly."
3. Every grounded answer MUST cite:
   - The supporting clause type
   - The page number
   - A verbatim quote extracted word-for-word from the text.
4. Parity is an informational assistant, not an attorney. Do not give legal counsel.

Respond with valid JSON only.`;

  const userPrompt = `USER QUESTION:
"${cleanQ}"

AVAILABLE CLAUSES:
${JSON.stringify(
  topCandidates.map((tc) => ({
    id: tc.clause.id,
    page: tc.clause.pageNumber,
    topic: tc.clause.clauseType,
    title: tc.clause.sectionTitle,
    text: tc.clause.clauseText,
  })),
  null,
  2
)}

Return a JSON object:
{
  "answer": "1-3 plain-language sentences directly answering what the contract says, or stating it cannot be determined.",
  "status": "grounded" | "insufficient_evidence",
  "supportingClauseId": "<id of matching clause or null>",
  "pageNumber": <number or null>,
  "verbatimQuote": "<exact excerpt from text or null>",
  "limitationNote": "<brief note on what cannot be established if any>"
}`;

  const QAAnswerSchema = z.object({
    answer: z.string(),
    status: z.enum(['grounded', 'insufficient_evidence']),
    supportingClauseId: z.string().nullable().optional(),
    pageNumber: z.number().nullable().optional(),
    verbatimQuote: z.string().nullable().optional(),
    limitationNote: z.string().optional(),
  });

  const result = await executeStructuredAI({
    systemPrompt,
    userPrompt,
    schema: QAAnswerSchema,
    deterministicFallback: () => generateFallbackAnswer(cleanQ, bestCandidate.clause),
  });

  const data = result.data;
  const supportingClause = clauses.find((c) => c.id === data.supportingClauseId) || bestCandidate.clause;

  return {
    question: cleanQ,
    answer: data.answer,
    status: data.status === 'grounded' ? EvidenceStatus.Grounded : EvidenceStatus.InsufficientEvidence,
    supportingClauseId: data.status === 'grounded' ? supportingClause.id : null,
    supportingClauseType: data.status === 'grounded' ? supportingClause.clauseType : null,
    pageNumber: data.status === 'grounded' ? supportingClause.pageNumber : null,
    verbatimQuote: data.status === 'grounded' ? data.verbatimQuote || extractVerbatimSnippet(supportingClause.clauseText) : null,
    limitationNote: data.limitationNote,
  };
}

function generateFallbackAnswer(
  question: string,
  candidate: ClauseContext
): {
  answer: string;
  status: 'grounded' | 'insufficient_evidence';
  supportingClauseId: string | null;
  pageNumber: number | null;
  verbatimQuote: string | null;
  limitationNote?: string;
} {
  const qLower = question.toLowerCase();
  const cLower = `${candidate.sectionTitle || ''} ${candidate.clauseType} ${candidate.clauseText}`.toLowerCase();

  // Check if candidate actually mentions key question terms
  const terms = qLower.split(/\s+/).filter((w) => w.length > 3 && !['what', 'when', 'where', 'does', 'have', 'with'].includes(w));
  const matchedTerms = terms.filter((t) => cLower.includes(t));

  if (matchedTerms.length === 0) {
    return {
      answer: "I couldn't find a clause in this document that answers this question clearly.",
      status: 'insufficient_evidence',
      supportingClauseId: null,
      pageNumber: null,
      verbatimQuote: null,
      limitationNote: 'The agreement does not explicitly address this scenario in the reviewed sections.',
    };
  }

  // Answer grounded in the candidate clause
  return {
    answer: `Based on Section ${candidate.clauseIndex} (${candidate.clauseType}), the document states: "${extractVerbatimSnippet(candidate.clauseText)}".`,
    status: 'grounded',
    supportingClauseId: candidate.id,
    pageNumber: candidate.pageNumber,
    verbatimQuote: extractVerbatimSnippet(candidate.clauseText),
    limitationNote: 'Refer directly to the cited clause text for exact binding wording.',
  };
}

function extractVerbatimSnippet(text: string, maxLen = 140): string {
  const firstSentence = text.split(/\.\s+/)[0] || text;
  return firstSentence.length > maxLen ? `${firstSentence.slice(0, maxLen)}...` : firstSentence;
}

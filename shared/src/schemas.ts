import { z } from 'zod';
import {
  DocumentType,
  ClauseType,
  RiskTier,
  ProcessingStatus,
  ComparisonVerdict,
  SignificanceTier,
  EvidenceStatus,
} from './taxonomy';

/**
 * Risk judgment schema (structured LLM output)
 */
export const RiskJudgmentSchema = z.object({
  tier: z.nativeEnum(RiskTier),
  explanation: z.string().min(1),
  reasonCodes: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.85),
  plainMeaning: z.string().optional(),
  whyItMatters: z.string().optional(),
});
export type RiskJudgment = z.infer<typeof RiskJudgmentSchema>;

/**
 * Fine Print, Translated Item
 */
export const FinePrintItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  explanation: z.string(),
  tier: z.enum([RiskTier.RedFlag, RiskTier.WorthASecondLook, RiskTier.Fair]),
  relatedClauseIndex: z.number(),
  relatedClauseType: z.nativeEnum(ClauseType).optional(),
});
export type FinePrintItem = z.infer<typeof FinePrintItemSchema>;

/**
 * Clause Schema
 */
export const ClauseSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  pageNumber: z.number().default(1),
  sectionTitle: z.string().nullable().optional(),
  clauseIndex: z.number(),
  clauseType: z.nativeEnum(ClauseType),
  clauseText: z.string(),
  contentHash: z.string(),
  similarityScore: z.number().nullable().optional(),
  nearestBenchmarkId: z.string().nullable().optional(),
  riskTier: z.nativeEnum(RiskTier).nullable().optional(),
  riskExplanation: z.string().nullable().optional(),
  plainMeaning: z.string().nullable().optional(),
  whyItMatters: z.string().nullable().optional(),
  reasonCodes: z.array(z.string()).default([]),
  evidenceStatus: z.nativeEnum(EvidenceStatus).default(EvidenceStatus.Grounded),
  createdAt: z.string().or(z.date()).optional(),
});
export type Clause = z.infer<typeof ClauseSchema>;

/**
 * Key Terms Schema
 */
export const KeyTermsSchema = z.object({
  parties: z.array(z.string()).default([]),
  duration: z.string().nullable().optional(),
  payment: z.string().nullable().optional(),
  noticePeriod: z.string().nullable().optional(),
  penalties: z.string().nullable().optional(),
  renewal: z.string().nullable().optional(),
  jurisdiction: z.string().nullable().optional(),
  deposit: z.string().nullable().optional(),
  importantDates: z.array(z.string()).default([]),
});
export type KeyTerms = z.infer<typeof KeyTermsSchema>;

/**
 * Obligations Schema
 */
export const ObligationsSchema = z.object({
  yourObligations: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      clauseIndex: z.number().optional(),
      isCritical: z.boolean().default(false),
    })
  ).default([]),
  theirObligations: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      clauseIndex: z.number().optional(),
      isCritical: z.boolean().default(false),
    })
  ).default([]),
});
export type Obligations = z.infer<typeof ObligationsSchema>;

/**
 * Timeline Item Schema
 */
export const TimelineItemSchema = z.object({
  id: z.string(),
  milestone: z.string(),
  timing: z.string(),
  type: z.enum(['explicit_date', 'duration', 'inferred']),
  description: z.string(),
  relativeOrder: z.number().default(0),
});
export type TimelineItem = z.infer<typeof TimelineItemSchema>;

/**
 * Document Analysis Summary Schema
 */
export const DocumentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  documentType: z.nativeEnum(DocumentType),
  status: z.nativeEnum(ProcessingStatus),
  isDemo: z.boolean().default(false),
  errorMessage: z.string().nullable().optional(),
  pageCount: z.number().default(1),
  clauseCount: z.number().default(0),
  uploadedAt: z.string().or(z.date()),
  keyTerms: KeyTermsSchema.optional(),
  finePrint: z.array(FinePrintItemSchema).default([]),
  obligations: ObligationsSchema.optional(),
  timeline: z.array(TimelineItemSchema).default([]),
});
export type Document = z.infer<typeof DocumentSchema>;

/**
 * Comparison Topic Schema
 */
export const ComparisonTopicSchema = z.object({
  topic: z.nativeEnum(ClauseType),
  docAText: z.string().nullable(),
  docBText: z.string().nullable(),
  verdict: z.nativeEnum(ComparisonVerdict),
  explanation: z.string(),
  significance: z.nativeEnum(SignificanceTier),
  keyDifference: z.string().optional(),
});
export type ComparisonTopic = z.infer<typeof ComparisonTopicSchema>;

/**
 * Comparison Result Schema
 */
export const ComparisonResultSchema = z.object({
  id: z.string(),
  documentAId: z.string(),
  documentBId: z.string(),
  labelA: z.string(),
  labelB: z.string(),
  isDemo: z.boolean().default(false),
  createdAt: z.string().or(z.date()),
  summary: z.object({
    aStrongerCount: z.number(),
    bStrongerCount: z.number(),
    equivalentCount: z.number(),
    missingProtectionCount: z.number(),
    totalTopicsCompared: z.number(),
  }),
  topics: z.array(ComparisonTopicSchema),
});
export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;

/**
 * Contextual Q&A Schemas
 */
export const QARequestSchema = z.object({
  question: z.string().min(3).max(500),
});
export type QARequest = z.infer<typeof QARequestSchema>;

export const QAResponseSchema = z.object({
  question: z.string(),
  answer: z.string(),
  status: z.nativeEnum(EvidenceStatus),
  supportingClauseId: z.string().nullable().optional(),
  supportingClauseType: z.nativeEnum(ClauseType).nullable().optional(),
  pageNumber: z.number().nullable().optional(),
  verbatimQuote: z.string().nullable().optional(),
  limitationNote: z.string().optional(),
});
export type QAResponse = z.infer<typeof QAResponseSchema>;

/**
 * Benchmark Clause Schema
 */
export const BenchmarkClauseSchema = z.object({
  id: z.string(),
  documentType: z.nativeEnum(DocumentType),
  clauseType: z.nativeEnum(ClauseType),
  referenceText: z.string(),
  plainLanguageMeaning: z.string(),
  commonRiskPatterns: z.array(z.string()).default([]),
  sourceAttribution: z.string(),
});
export type BenchmarkClause = z.infer<typeof BenchmarkClauseSchema>;

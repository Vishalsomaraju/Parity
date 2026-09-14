"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkClauseSchema = exports.QAResponseSchema = exports.QARequestSchema = exports.ComparisonResultSchema = exports.ComparisonTopicSchema = exports.DocumentSchema = exports.TimelineItemSchema = exports.ObligationsSchema = exports.KeyTermsSchema = exports.ClauseSchema = exports.FinePrintItemSchema = exports.RiskJudgmentSchema = void 0;
const zod_1 = require("zod");
const taxonomy_1 = require("./taxonomy");
/**
 * Risk judgment schema (structured LLM output)
 */
exports.RiskJudgmentSchema = zod_1.z.object({
    tier: zod_1.z.nativeEnum(taxonomy_1.RiskTier),
    explanation: zod_1.z.string().min(1),
    reasonCodes: zod_1.z.array(zod_1.z.string()).default([]),
    confidence: zod_1.z.number().min(0).max(1).default(0.85),
    plainMeaning: zod_1.z.string().optional(),
    whyItMatters: zod_1.z.string().optional(),
});
/**
 * Fine Print, Translated Item
 */
exports.FinePrintItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    explanation: zod_1.z.string(),
    tier: zod_1.z.enum([taxonomy_1.RiskTier.RedFlag, taxonomy_1.RiskTier.WorthASecondLook, taxonomy_1.RiskTier.Fair]),
    relatedClauseIndex: zod_1.z.number(),
    relatedClauseType: zod_1.z.nativeEnum(taxonomy_1.ClauseType).optional(),
});
/**
 * Clause Schema
 */
exports.ClauseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    documentId: zod_1.z.string(),
    pageNumber: zod_1.z.number().default(1),
    sectionTitle: zod_1.z.string().nullable().optional(),
    clauseIndex: zod_1.z.number(),
    clauseType: zod_1.z.nativeEnum(taxonomy_1.ClauseType),
    clauseText: zod_1.z.string(),
    contentHash: zod_1.z.string(),
    similarityScore: zod_1.z.number().nullable().optional(),
    nearestBenchmarkId: zod_1.z.string().nullable().optional(),
    riskTier: zod_1.z.nativeEnum(taxonomy_1.RiskTier).nullable().optional(),
    riskExplanation: zod_1.z.string().nullable().optional(),
    plainMeaning: zod_1.z.string().nullable().optional(),
    whyItMatters: zod_1.z.string().nullable().optional(),
    reasonCodes: zod_1.z.array(zod_1.z.string()).default([]),
    evidenceStatus: zod_1.z.nativeEnum(taxonomy_1.EvidenceStatus).default(taxonomy_1.EvidenceStatus.Grounded),
    createdAt: zod_1.z.string().or(zod_1.z.date()).optional(),
});
/**
 * Key Terms Schema
 */
exports.KeyTermsSchema = zod_1.z.object({
    parties: zod_1.z.array(zod_1.z.string()).default([]),
    duration: zod_1.z.string().nullable().optional(),
    payment: zod_1.z.string().nullable().optional(),
    noticePeriod: zod_1.z.string().nullable().optional(),
    penalties: zod_1.z.string().nullable().optional(),
    renewal: zod_1.z.string().nullable().optional(),
    jurisdiction: zod_1.z.string().nullable().optional(),
    deposit: zod_1.z.string().nullable().optional(),
    importantDates: zod_1.z.array(zod_1.z.string()).default([]),
});
/**
 * Obligations Schema
 */
exports.ObligationsSchema = zod_1.z.object({
    yourObligations: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string(),
        clauseIndex: zod_1.z.number().optional(),
        isCritical: zod_1.z.boolean().default(false),
    })).default([]),
    theirObligations: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string(),
        clauseIndex: zod_1.z.number().optional(),
        isCritical: zod_1.z.boolean().default(false),
    })).default([]),
});
/**
 * Timeline Item Schema
 */
exports.TimelineItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    milestone: zod_1.z.string(),
    timing: zod_1.z.string(),
    type: zod_1.z.enum(['explicit_date', 'duration', 'inferred']),
    description: zod_1.z.string(),
    relativeOrder: zod_1.z.number().default(0),
});
/**
 * Document Analysis Summary Schema
 */
exports.DocumentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    filename: zod_1.z.string(),
    documentType: zod_1.z.nativeEnum(taxonomy_1.DocumentType),
    status: zod_1.z.nativeEnum(taxonomy_1.ProcessingStatus),
    isDemo: zod_1.z.boolean().default(false),
    errorMessage: zod_1.z.string().nullable().optional(),
    pageCount: zod_1.z.number().default(1),
    clauseCount: zod_1.z.number().default(0),
    uploadedAt: zod_1.z.string().or(zod_1.z.date()),
    keyTerms: exports.KeyTermsSchema.optional(),
    finePrint: zod_1.z.array(exports.FinePrintItemSchema).default([]),
    obligations: exports.ObligationsSchema.optional(),
    timeline: zod_1.z.array(exports.TimelineItemSchema).default([]),
});
/**
 * Comparison Topic Schema
 */
exports.ComparisonTopicSchema = zod_1.z.object({
    topic: zod_1.z.nativeEnum(taxonomy_1.ClauseType),
    docAText: zod_1.z.string().nullable(),
    docBText: zod_1.z.string().nullable(),
    verdict: zod_1.z.nativeEnum(taxonomy_1.ComparisonVerdict),
    explanation: zod_1.z.string(),
    significance: zod_1.z.nativeEnum(taxonomy_1.SignificanceTier),
    keyDifference: zod_1.z.string().optional(),
});
/**
 * Comparison Result Schema
 */
exports.ComparisonResultSchema = zod_1.z.object({
    id: zod_1.z.string(),
    documentAId: zod_1.z.string(),
    documentBId: zod_1.z.string(),
    labelA: zod_1.z.string(),
    labelB: zod_1.z.string(),
    isDemo: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string().or(zod_1.z.date()),
    summary: zod_1.z.object({
        aStrongerCount: zod_1.z.number(),
        bStrongerCount: zod_1.z.number(),
        equivalentCount: zod_1.z.number(),
        missingProtectionCount: zod_1.z.number(),
        totalTopicsCompared: zod_1.z.number(),
    }),
    topics: zod_1.z.array(exports.ComparisonTopicSchema),
});
/**
 * Contextual Q&A Schemas
 */
exports.QARequestSchema = zod_1.z.object({
    question: zod_1.z.string().min(3).max(500),
});
exports.QAResponseSchema = zod_1.z.object({
    question: zod_1.z.string(),
    answer: zod_1.z.string(),
    status: zod_1.z.nativeEnum(taxonomy_1.EvidenceStatus),
    supportingClauseId: zod_1.z.string().nullable().optional(),
    supportingClauseType: zod_1.z.nativeEnum(taxonomy_1.ClauseType).nullable().optional(),
    pageNumber: zod_1.z.number().nullable().optional(),
    verbatimQuote: zod_1.z.string().nullable().optional(),
    limitationNote: zod_1.z.string().optional(),
});
/**
 * Benchmark Clause Schema
 */
exports.BenchmarkClauseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    documentType: zod_1.z.nativeEnum(taxonomy_1.DocumentType),
    clauseType: zod_1.z.nativeEnum(taxonomy_1.ClauseType),
    referenceText: zod_1.z.string(),
    plainLanguageMeaning: zod_1.z.string(),
    commonRiskPatterns: zod_1.z.array(zod_1.z.string()).default([]),
    sourceAttribution: zod_1.z.string(),
});

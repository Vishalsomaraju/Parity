import { z } from 'zod';
import { DocumentType, ClauseType, RiskTier, ProcessingStatus, ComparisonVerdict, SignificanceTier, EvidenceStatus } from './taxonomy';
/**
 * Risk judgment schema (structured LLM output)
 */
export declare const RiskJudgmentSchema: z.ZodObject<{
    tier: z.ZodNativeEnum<typeof RiskTier>;
    explanation: z.ZodString;
    reasonCodes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    confidence: z.ZodDefault<z.ZodNumber>;
    plainMeaning: z.ZodOptional<z.ZodString>;
    whyItMatters: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tier: RiskTier;
    explanation: string;
    reasonCodes: string[];
    confidence: number;
    plainMeaning?: string | undefined;
    whyItMatters?: string | undefined;
}, {
    tier: RiskTier;
    explanation: string;
    reasonCodes?: string[] | undefined;
    confidence?: number | undefined;
    plainMeaning?: string | undefined;
    whyItMatters?: string | undefined;
}>;
export type RiskJudgment = z.infer<typeof RiskJudgmentSchema>;
/**
 * Fine Print, Translated Item
 */
export declare const FinePrintItemSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    explanation: z.ZodString;
    tier: z.ZodEnum<[RiskTier.RedFlag, RiskTier.WorthASecondLook, RiskTier.Fair]>;
    relatedClauseIndex: z.ZodNumber;
    relatedClauseType: z.ZodOptional<z.ZodNativeEnum<typeof ClauseType>>;
}, "strip", z.ZodTypeAny, {
    tier: RiskTier;
    explanation: string;
    id: string;
    title: string;
    relatedClauseIndex: number;
    relatedClauseType?: ClauseType | undefined;
}, {
    tier: RiskTier;
    explanation: string;
    id: string;
    title: string;
    relatedClauseIndex: number;
    relatedClauseType?: ClauseType | undefined;
}>;
export type FinePrintItem = z.infer<typeof FinePrintItemSchema>;
/**
 * Clause Schema
 */
export declare const ClauseSchema: z.ZodObject<{
    id: z.ZodString;
    documentId: z.ZodString;
    pageNumber: z.ZodDefault<z.ZodNumber>;
    sectionTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    clauseIndex: z.ZodNumber;
    clauseType: z.ZodNativeEnum<typeof ClauseType>;
    clauseText: z.ZodString;
    contentHash: z.ZodString;
    similarityScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    nearestBenchmarkId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    riskTier: z.ZodOptional<z.ZodNullable<z.ZodNativeEnum<typeof RiskTier>>>;
    riskExplanation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    plainMeaning: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    whyItMatters: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reasonCodes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceStatus: z.ZodDefault<z.ZodNativeEnum<typeof EvidenceStatus>>;
    createdAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
}, "strip", z.ZodTypeAny, {
    reasonCodes: string[];
    id: string;
    documentId: string;
    pageNumber: number;
    clauseIndex: number;
    clauseType: ClauseType;
    clauseText: string;
    contentHash: string;
    evidenceStatus: EvidenceStatus;
    plainMeaning?: string | null | undefined;
    whyItMatters?: string | null | undefined;
    sectionTitle?: string | null | undefined;
    similarityScore?: number | null | undefined;
    nearestBenchmarkId?: string | null | undefined;
    riskTier?: RiskTier | null | undefined;
    riskExplanation?: string | null | undefined;
    createdAt?: string | Date | undefined;
}, {
    id: string;
    documentId: string;
    clauseIndex: number;
    clauseType: ClauseType;
    clauseText: string;
    contentHash: string;
    reasonCodes?: string[] | undefined;
    plainMeaning?: string | null | undefined;
    whyItMatters?: string | null | undefined;
    pageNumber?: number | undefined;
    sectionTitle?: string | null | undefined;
    similarityScore?: number | null | undefined;
    nearestBenchmarkId?: string | null | undefined;
    riskTier?: RiskTier | null | undefined;
    riskExplanation?: string | null | undefined;
    evidenceStatus?: EvidenceStatus | undefined;
    createdAt?: string | Date | undefined;
}>;
export type Clause = z.infer<typeof ClauseSchema>;
/**
 * Key Terms Schema
 */
export declare const KeyTermsSchema: z.ZodObject<{
    parties: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    duration: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    payment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    noticePeriod: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    penalties: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    renewal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    jurisdiction: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    deposit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    importantDates: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    parties: string[];
    importantDates: string[];
    duration?: string | null | undefined;
    payment?: string | null | undefined;
    noticePeriod?: string | null | undefined;
    penalties?: string | null | undefined;
    renewal?: string | null | undefined;
    jurisdiction?: string | null | undefined;
    deposit?: string | null | undefined;
}, {
    duration?: string | null | undefined;
    parties?: string[] | undefined;
    payment?: string | null | undefined;
    noticePeriod?: string | null | undefined;
    penalties?: string | null | undefined;
    renewal?: string | null | undefined;
    jurisdiction?: string | null | undefined;
    deposit?: string | null | undefined;
    importantDates?: string[] | undefined;
}>;
export type KeyTerms = z.infer<typeof KeyTermsSchema>;
/**
 * Obligations Schema
 */
export declare const ObligationsSchema: z.ZodObject<{
    yourObligations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        clauseIndex: z.ZodOptional<z.ZodNumber>;
        isCritical: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        isCritical: boolean;
        clauseIndex?: number | undefined;
    }, {
        id: string;
        description: string;
        clauseIndex?: number | undefined;
        isCritical?: boolean | undefined;
    }>, "many">>;
    theirObligations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        clauseIndex: z.ZodOptional<z.ZodNumber>;
        isCritical: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        isCritical: boolean;
        clauseIndex?: number | undefined;
    }, {
        id: string;
        description: string;
        clauseIndex?: number | undefined;
        isCritical?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    yourObligations: {
        id: string;
        description: string;
        isCritical: boolean;
        clauseIndex?: number | undefined;
    }[];
    theirObligations: {
        id: string;
        description: string;
        isCritical: boolean;
        clauseIndex?: number | undefined;
    }[];
}, {
    yourObligations?: {
        id: string;
        description: string;
        clauseIndex?: number | undefined;
        isCritical?: boolean | undefined;
    }[] | undefined;
    theirObligations?: {
        id: string;
        description: string;
        clauseIndex?: number | undefined;
        isCritical?: boolean | undefined;
    }[] | undefined;
}>;
export type Obligations = z.infer<typeof ObligationsSchema>;
/**
 * Timeline Item Schema
 */
export declare const TimelineItemSchema: z.ZodObject<{
    id: z.ZodString;
    milestone: z.ZodString;
    timing: z.ZodString;
    type: z.ZodEnum<["explicit_date", "duration", "inferred"]>;
    description: z.ZodString;
    relativeOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "explicit_date" | "duration" | "inferred";
    id: string;
    description: string;
    milestone: string;
    timing: string;
    relativeOrder: number;
}, {
    type: "explicit_date" | "duration" | "inferred";
    id: string;
    description: string;
    milestone: string;
    timing: string;
    relativeOrder?: number | undefined;
}>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
/**
 * Document Analysis Summary Schema
 */
export declare const DocumentSchema: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    documentType: z.ZodNativeEnum<typeof DocumentType>;
    status: z.ZodNativeEnum<typeof ProcessingStatus>;
    isDemo: z.ZodDefault<z.ZodBoolean>;
    errorMessage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pageCount: z.ZodDefault<z.ZodNumber>;
    clauseCount: z.ZodDefault<z.ZodNumber>;
    uploadedAt: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    keyTerms: z.ZodOptional<z.ZodObject<{
        parties: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        duration: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        payment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        noticePeriod: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        penalties: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        renewal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        jurisdiction: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        deposit: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        importantDates: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        parties: string[];
        importantDates: string[];
        duration?: string | null | undefined;
        payment?: string | null | undefined;
        noticePeriod?: string | null | undefined;
        penalties?: string | null | undefined;
        renewal?: string | null | undefined;
        jurisdiction?: string | null | undefined;
        deposit?: string | null | undefined;
    }, {
        duration?: string | null | undefined;
        parties?: string[] | undefined;
        payment?: string | null | undefined;
        noticePeriod?: string | null | undefined;
        penalties?: string | null | undefined;
        renewal?: string | null | undefined;
        jurisdiction?: string | null | undefined;
        deposit?: string | null | undefined;
        importantDates?: string[] | undefined;
    }>>;
    finePrint: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        explanation: z.ZodString;
        tier: z.ZodEnum<[RiskTier.RedFlag, RiskTier.WorthASecondLook, RiskTier.Fair]>;
        relatedClauseIndex: z.ZodNumber;
        relatedClauseType: z.ZodOptional<z.ZodNativeEnum<typeof ClauseType>>;
    }, "strip", z.ZodTypeAny, {
        tier: RiskTier;
        explanation: string;
        id: string;
        title: string;
        relatedClauseIndex: number;
        relatedClauseType?: ClauseType | undefined;
    }, {
        tier: RiskTier;
        explanation: string;
        id: string;
        title: string;
        relatedClauseIndex: number;
        relatedClauseType?: ClauseType | undefined;
    }>, "many">>;
    obligations: z.ZodOptional<z.ZodObject<{
        yourObligations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            clauseIndex: z.ZodOptional<z.ZodNumber>;
            isCritical: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
            isCritical: boolean;
            clauseIndex?: number | undefined;
        }, {
            id: string;
            description: string;
            clauseIndex?: number | undefined;
            isCritical?: boolean | undefined;
        }>, "many">>;
        theirObligations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            clauseIndex: z.ZodOptional<z.ZodNumber>;
            isCritical: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
            isCritical: boolean;
            clauseIndex?: number | undefined;
        }, {
            id: string;
            description: string;
            clauseIndex?: number | undefined;
            isCritical?: boolean | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        yourObligations: {
            id: string;
            description: string;
            isCritical: boolean;
            clauseIndex?: number | undefined;
        }[];
        theirObligations: {
            id: string;
            description: string;
            isCritical: boolean;
            clauseIndex?: number | undefined;
        }[];
    }, {
        yourObligations?: {
            id: string;
            description: string;
            clauseIndex?: number | undefined;
            isCritical?: boolean | undefined;
        }[] | undefined;
        theirObligations?: {
            id: string;
            description: string;
            clauseIndex?: number | undefined;
            isCritical?: boolean | undefined;
        }[] | undefined;
    }>>;
    timeline: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        milestone: z.ZodString;
        timing: z.ZodString;
        type: z.ZodEnum<["explicit_date", "duration", "inferred"]>;
        description: z.ZodString;
        relativeOrder: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "explicit_date" | "duration" | "inferred";
        id: string;
        description: string;
        milestone: string;
        timing: string;
        relativeOrder: number;
    }, {
        type: "explicit_date" | "duration" | "inferred";
        id: string;
        description: string;
        milestone: string;
        timing: string;
        relativeOrder?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: ProcessingStatus;
    id: string;
    filename: string;
    documentType: DocumentType;
    isDemo: boolean;
    pageCount: number;
    clauseCount: number;
    uploadedAt: string | Date;
    finePrint: {
        tier: RiskTier;
        explanation: string;
        id: string;
        title: string;
        relatedClauseIndex: number;
        relatedClauseType?: ClauseType | undefined;
    }[];
    timeline: {
        type: "explicit_date" | "duration" | "inferred";
        id: string;
        description: string;
        milestone: string;
        timing: string;
        relativeOrder: number;
    }[];
    errorMessage?: string | null | undefined;
    keyTerms?: {
        parties: string[];
        importantDates: string[];
        duration?: string | null | undefined;
        payment?: string | null | undefined;
        noticePeriod?: string | null | undefined;
        penalties?: string | null | undefined;
        renewal?: string | null | undefined;
        jurisdiction?: string | null | undefined;
        deposit?: string | null | undefined;
    } | undefined;
    obligations?: {
        yourObligations: {
            id: string;
            description: string;
            isCritical: boolean;
            clauseIndex?: number | undefined;
        }[];
        theirObligations: {
            id: string;
            description: string;
            isCritical: boolean;
            clauseIndex?: number | undefined;
        }[];
    } | undefined;
}, {
    status: ProcessingStatus;
    id: string;
    filename: string;
    documentType: DocumentType;
    uploadedAt: string | Date;
    isDemo?: boolean | undefined;
    errorMessage?: string | null | undefined;
    pageCount?: number | undefined;
    clauseCount?: number | undefined;
    keyTerms?: {
        duration?: string | null | undefined;
        parties?: string[] | undefined;
        payment?: string | null | undefined;
        noticePeriod?: string | null | undefined;
        penalties?: string | null | undefined;
        renewal?: string | null | undefined;
        jurisdiction?: string | null | undefined;
        deposit?: string | null | undefined;
        importantDates?: string[] | undefined;
    } | undefined;
    finePrint?: {
        tier: RiskTier;
        explanation: string;
        id: string;
        title: string;
        relatedClauseIndex: number;
        relatedClauseType?: ClauseType | undefined;
    }[] | undefined;
    obligations?: {
        yourObligations?: {
            id: string;
            description: string;
            clauseIndex?: number | undefined;
            isCritical?: boolean | undefined;
        }[] | undefined;
        theirObligations?: {
            id: string;
            description: string;
            clauseIndex?: number | undefined;
            isCritical?: boolean | undefined;
        }[] | undefined;
    } | undefined;
    timeline?: {
        type: "explicit_date" | "duration" | "inferred";
        id: string;
        description: string;
        milestone: string;
        timing: string;
        relativeOrder?: number | undefined;
    }[] | undefined;
}>;
export type Document = z.infer<typeof DocumentSchema>;
/**
 * Comparison Topic Schema
 */
export declare const ComparisonTopicSchema: z.ZodObject<{
    topic: z.ZodNativeEnum<typeof ClauseType>;
    docAText: z.ZodNullable<z.ZodString>;
    docBText: z.ZodNullable<z.ZodString>;
    verdict: z.ZodNativeEnum<typeof ComparisonVerdict>;
    explanation: z.ZodString;
    significance: z.ZodNativeEnum<typeof SignificanceTier>;
    keyDifference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    explanation: string;
    topic: ClauseType;
    docAText: string | null;
    docBText: string | null;
    verdict: ComparisonVerdict;
    significance: SignificanceTier;
    keyDifference?: string | undefined;
}, {
    explanation: string;
    topic: ClauseType;
    docAText: string | null;
    docBText: string | null;
    verdict: ComparisonVerdict;
    significance: SignificanceTier;
    keyDifference?: string | undefined;
}>;
export type ComparisonTopic = z.infer<typeof ComparisonTopicSchema>;
/**
 * Comparison Result Schema
 */
export declare const ComparisonResultSchema: z.ZodObject<{
    id: z.ZodString;
    documentAId: z.ZodString;
    documentBId: z.ZodString;
    labelA: z.ZodString;
    labelB: z.ZodString;
    isDemo: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    summary: z.ZodObject<{
        aStrongerCount: z.ZodNumber;
        bStrongerCount: z.ZodNumber;
        equivalentCount: z.ZodNumber;
        missingProtectionCount: z.ZodNumber;
        totalTopicsCompared: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        aStrongerCount: number;
        bStrongerCount: number;
        equivalentCount: number;
        missingProtectionCount: number;
        totalTopicsCompared: number;
    }, {
        aStrongerCount: number;
        bStrongerCount: number;
        equivalentCount: number;
        missingProtectionCount: number;
        totalTopicsCompared: number;
    }>;
    topics: z.ZodArray<z.ZodObject<{
        topic: z.ZodNativeEnum<typeof ClauseType>;
        docAText: z.ZodNullable<z.ZodString>;
        docBText: z.ZodNullable<z.ZodString>;
        verdict: z.ZodNativeEnum<typeof ComparisonVerdict>;
        explanation: z.ZodString;
        significance: z.ZodNativeEnum<typeof SignificanceTier>;
        keyDifference: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        explanation: string;
        topic: ClauseType;
        docAText: string | null;
        docBText: string | null;
        verdict: ComparisonVerdict;
        significance: SignificanceTier;
        keyDifference?: string | undefined;
    }, {
        explanation: string;
        topic: ClauseType;
        docAText: string | null;
        docBText: string | null;
        verdict: ComparisonVerdict;
        significance: SignificanceTier;
        keyDifference?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string | Date;
    isDemo: boolean;
    documentAId: string;
    documentBId: string;
    labelA: string;
    labelB: string;
    summary: {
        aStrongerCount: number;
        bStrongerCount: number;
        equivalentCount: number;
        missingProtectionCount: number;
        totalTopicsCompared: number;
    };
    topics: {
        explanation: string;
        topic: ClauseType;
        docAText: string | null;
        docBText: string | null;
        verdict: ComparisonVerdict;
        significance: SignificanceTier;
        keyDifference?: string | undefined;
    }[];
}, {
    id: string;
    createdAt: string | Date;
    documentAId: string;
    documentBId: string;
    labelA: string;
    labelB: string;
    summary: {
        aStrongerCount: number;
        bStrongerCount: number;
        equivalentCount: number;
        missingProtectionCount: number;
        totalTopicsCompared: number;
    };
    topics: {
        explanation: string;
        topic: ClauseType;
        docAText: string | null;
        docBText: string | null;
        verdict: ComparisonVerdict;
        significance: SignificanceTier;
        keyDifference?: string | undefined;
    }[];
    isDemo?: boolean | undefined;
}>;
export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;
/**
 * Contextual Q&A Schemas
 */
export declare const QARequestSchema: z.ZodObject<{
    question: z.ZodString;
}, "strip", z.ZodTypeAny, {
    question: string;
}, {
    question: string;
}>;
export type QARequest = z.infer<typeof QARequestSchema>;
export declare const QAResponseSchema: z.ZodObject<{
    question: z.ZodString;
    answer: z.ZodString;
    status: z.ZodNativeEnum<typeof EvidenceStatus>;
    supportingClauseId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    supportingClauseType: z.ZodOptional<z.ZodNullable<z.ZodNativeEnum<typeof ClauseType>>>;
    pageNumber: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    verbatimQuote: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    limitationNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: EvidenceStatus;
    question: string;
    answer: string;
    pageNumber?: number | null | undefined;
    supportingClauseId?: string | null | undefined;
    supportingClauseType?: ClauseType | null | undefined;
    verbatimQuote?: string | null | undefined;
    limitationNote?: string | undefined;
}, {
    status: EvidenceStatus;
    question: string;
    answer: string;
    pageNumber?: number | null | undefined;
    supportingClauseId?: string | null | undefined;
    supportingClauseType?: ClauseType | null | undefined;
    verbatimQuote?: string | null | undefined;
    limitationNote?: string | undefined;
}>;
export type QAResponse = z.infer<typeof QAResponseSchema>;
/**
 * Benchmark Clause Schema
 */
export declare const BenchmarkClauseSchema: z.ZodObject<{
    id: z.ZodString;
    documentType: z.ZodNativeEnum<typeof DocumentType>;
    clauseType: z.ZodNativeEnum<typeof ClauseType>;
    referenceText: z.ZodString;
    plainLanguageMeaning: z.ZodString;
    commonRiskPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sourceAttribution: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    clauseType: ClauseType;
    documentType: DocumentType;
    referenceText: string;
    plainLanguageMeaning: string;
    commonRiskPatterns: string[];
    sourceAttribution: string;
}, {
    id: string;
    clauseType: ClauseType;
    documentType: DocumentType;
    referenceText: string;
    plainLanguageMeaning: string;
    sourceAttribution: string;
    commonRiskPatterns?: string[] | undefined;
}>;
export type BenchmarkClause = z.infer<typeof BenchmarkClauseSchema>;

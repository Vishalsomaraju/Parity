import {
  DocumentType,
  ClauseType,
  RiskTier,
  ProcessingStatus,
  ComparisonVerdict,
  SignificanceTier,
  EvidenceStatus,
} from './taxonomy';

export interface RiskJudgment {
  tier: RiskTier;
  explanation: string;
  reasonCodes?: string[];
  confidence?: number;
  plainMeaning?: string;
  whyItMatters?: string;
}

export interface FinePrintItem {
  id: string;
  title: string;
  explanation: string;
  tier: RiskTier;
  relatedClauseIndex: number;
  relatedClauseType?: ClauseType;
}

export interface Clause {
  id: string;
  documentId: string;
  pageNumber: number;
  sectionTitle?: string | null;
  clauseIndex: number;
  clauseType: ClauseType;
  clauseText: string;
  contentHash: string;
  similarityScore?: number | null;
  nearestBenchmarkId?: string | null;
  riskTier?: RiskTier | null;
  riskExplanation?: string | null;
  plainMeaning?: string | null;
  whyItMatters?: string | null;
  reasonCodes?: string[];
  evidenceStatus: EvidenceStatus;
  createdAt?: string | Date;
}

export interface KeyTerms {
  parties: string[];
  duration?: string | null;
  payment?: string | null;
  noticePeriod?: string | null;
  penalties?: string | null;
  renewal?: string | null;
  jurisdiction?: string | null;
  deposit?: string | null;
  importantDates?: string[];
}

export interface ObligationItem {
  id: string;
  description: string;
  clauseIndex?: number;
  isCritical?: boolean;
}

export interface Obligations {
  yourObligations: ObligationItem[];
  theirObligations: ObligationItem[];
}

export interface TimelineItem {
  id: string;
  milestone: string;
  timing: string;
  type: 'explicit_date' | 'duration' | 'inferred';
  description: string;
  relativeOrder: number;
}

export interface Document {
  id: string;
  filename: string;
  documentType: DocumentType;
  status: ProcessingStatus;
  isDemo: boolean;
  errorMessage?: string | null;
  pageCount: number;
  clauseCount: number;
  uploadedAt: string | Date;
  keyTerms?: KeyTerms;
  finePrint: FinePrintItem[];
  obligations?: Obligations;
  timeline: TimelineItem[];
}

export interface ComparisonTopic {
  topic: ClauseType;
  docAText: string | null;
  docBText: string | null;
  verdict: ComparisonVerdict;
  explanation: string;
  significance: SignificanceTier;
  keyDifference?: string;
}

export interface ComparisonSummary {
  aStrongerCount: number;
  bStrongerCount: number;
  equivalentCount: number;
  missingProtectionCount: number;
  totalTopicsCompared: number;
}

export interface ComparisonResult {
  id: string;
  documentAId: string;
  documentBId: string;
  labelA: string;
  labelB: string;
  isDemo: boolean;
  createdAt: string | Date;
  summary: ComparisonSummary;
  topics: ComparisonTopic[];
}

export interface QARequest {
  question: string;
}

export interface QAResponse {
  question: string;
  answer: string;
  status: EvidenceStatus;
  supportingClauseId?: string | null;
  supportingClauseType?: ClauseType | null;
  pageNumber?: number | null;
  verbatimQuote?: string | null;
  limitationNote?: string;
}

export interface BenchmarkClause {
  id: string;
  documentType: DocumentType;
  clauseType: ClauseType;
  referenceText: string;
  plainLanguageMeaning: string;
  commonRiskPatterns: string[];
  sourceAttribution: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  version: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    database: 'connected' | 'session_fallback';
    redis: 'connected' | 'bypassed';
    ai: 'primary_active' | 'secondary_active' | 'deterministic_fallback';
    worker: 'background_active' | 'in_process_fallback';
  };
}

export interface DocumentStatusResponse {
  id: string;
  status: string;
  isDemo: boolean;
  progressPercent: number;
  currentStep: string;
  errorMessage?: string | null;
}

export interface CompareRequest {
  documentAId: string;
  documentBId: string;
  labelA?: string;
  labelB?: string;
}

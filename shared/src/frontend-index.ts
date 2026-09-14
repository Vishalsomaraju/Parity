import * as taxonomy from './taxonomy';

export const {
  DocumentType,
  DOCUMENT_TYPE_LABELS,
  ClauseType,
  ALL_CLAUSE_TYPES,
  RiskTier,
  RISK_TIER_DESCRIPTIONS,
  ProcessingStatus,
  ComparisonVerdict,
  SignificanceTier,
  EvidenceStatus,
  LEGAL_DISCLAIMER,
} = taxonomy;

export type * from './types';
export type DocumentType = taxonomy.DocumentType;
export type ClauseType = taxonomy.ClauseType;
export type RiskTier = taxonomy.RiskTier;
export type ProcessingStatus = taxonomy.ProcessingStatus;
export type ComparisonVerdict = taxonomy.ComparisonVerdict;
export type SignificanceTier = taxonomy.SignificanceTier;
export type EvidenceStatus = taxonomy.EvidenceStatus;

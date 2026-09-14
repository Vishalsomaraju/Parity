/**
 * Parity Canonical Taxonomy & Vocabulary
 * Strictly aligned with the Parity specification.
 */

export enum DocumentType {
  FreelanceServices = 'freelance_services',
  ResidentialLease = 'residential_lease',
  PolicyToS = 'policy_tos',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.FreelanceServices]: 'Freelance / Services Agreement',
  [DocumentType.ResidentialLease]: 'Residential Lease Agreement',
  [DocumentType.PolicyToS]: 'Terms of Service / Privacy Policy',
};

/**
 * 20 Canonical Clause Types
 */
export enum ClauseType {
  PaymentTerms = 'Payment Terms',
  ScopeOfWork = 'Scope of Work',
  IntellectualProperty = 'Intellectual Property',
  Confidentiality = 'Confidentiality',
  Indemnification = 'Indemnification',
  LimitationOfLiability = 'Limitation of Liability',
  Termination = 'Termination',
  DisputeResolution = 'Dispute Resolution',
  GoverningLaw = 'Governing Law',
  NonCompeteNonSolicitation = 'Non-Compete / Non-Solicitation',
  Insurance = 'Insurance',
  Amendments = 'Amendments',
  ForceMajeure = 'Force Majeure',
  WarrantyRepresentations = 'Warranty / Representations',
  Assignment = 'Assignment',
  Notice = 'Notice',
  DataUsePrivacy = 'Data Use / Privacy',
  AutoRenewal = 'Auto-Renewal',
  FeesRefunds = 'Fees & Refunds',
  General = 'General',
}

export const ALL_CLAUSE_TYPES = Object.values(ClauseType);

/**
 * Exact User-Facing Risk Tiers
 */
export enum RiskTier {
  Fair = 'Fair',
  WorthASecondLook = 'Worth a Second Look',
  RedFlag = 'Red Flag',
}

export const RISK_TIER_DESCRIPTIONS: Record<RiskTier, string> = {
  [RiskTier.Fair]: 'No meaningful disadvantage versus the benchmark.',
  [RiskTier.WorthASecondLook]: 'Shifts risk or obligation toward the signer, but remains within a range commonly used in real contracts.',
  [RiskTier.RedFlag]: 'Removes a standard protection, makes an obligation one-sided, or exposes the signer to open-ended cost or liability.',
};

/**
 * Processing lifecycle states
 */
export enum ProcessingStatus {
  Queued = 'queued',
  Extracting = 'extracting',
  Segmenting = 'segmenting',
  Embedding = 'embedding',
  Analyzing = 'analyzing',
  Complete = 'complete',
  NeedsReview = 'needs_review',
  Failed = 'failed',
}

/**
 * Document-vs-Document Comparison Verdicts
 */
export enum ComparisonVerdict {
  ABetter = 'A better',
  BBetter = 'B better',
  Equivalent = 'equivalent',
  OnlyInA = 'only in A',
  OnlyInB = 'only in B',
}

export enum SignificanceTier {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

/**
 * Evidence Grounding State
 */
export enum EvidenceStatus {
  Grounded = 'grounded',
  InsufficientEvidence = 'insufficient_evidence',
  NeedsManualReview = 'needs_manual_review',
}

/**
 * Shared Legal Disclaimer
 */
export const LEGAL_DISCLAIMER =
  "This is plain-language information, not legal advice. Parity doesn't represent you and nothing here replaces a licensed attorney before you sign anything binding.";

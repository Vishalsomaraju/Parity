/**
 * Parity Canonical Taxonomy & Vocabulary
 * Strictly aligned with the Parity specification.
 */
export declare enum DocumentType {
    FreelanceServices = "freelance_services",
    ResidentialLease = "residential_lease",
    PolicyToS = "policy_tos"
}
export declare const DOCUMENT_TYPE_LABELS: Record<DocumentType, string>;
/**
 * 20 Canonical Clause Types
 */
export declare enum ClauseType {
    PaymentTerms = "Payment Terms",
    ScopeOfWork = "Scope of Work",
    IntellectualProperty = "Intellectual Property",
    Confidentiality = "Confidentiality",
    Indemnification = "Indemnification",
    LimitationOfLiability = "Limitation of Liability",
    Termination = "Termination",
    DisputeResolution = "Dispute Resolution",
    GoverningLaw = "Governing Law",
    NonCompeteNonSolicitation = "Non-Compete / Non-Solicitation",
    Insurance = "Insurance",
    Amendments = "Amendments",
    ForceMajeure = "Force Majeure",
    WarrantyRepresentations = "Warranty / Representations",
    Assignment = "Assignment",
    Notice = "Notice",
    DataUsePrivacy = "Data Use / Privacy",
    AutoRenewal = "Auto-Renewal",
    FeesRefunds = "Fees & Refunds",
    General = "General"
}
export declare const ALL_CLAUSE_TYPES: ClauseType[];
/**
 * Exact User-Facing Risk Tiers
 */
export declare enum RiskTier {
    Fair = "Fair",
    WorthASecondLook = "Worth a Second Look",
    RedFlag = "Red Flag"
}
export declare const RISK_TIER_DESCRIPTIONS: Record<RiskTier, string>;
/**
 * Processing lifecycle states
 */
export declare enum ProcessingStatus {
    Queued = "queued",
    Extracting = "extracting",
    Segmenting = "segmenting",
    Embedding = "embedding",
    Analyzing = "analyzing",
    Complete = "complete",
    NeedsReview = "needs_review",
    Failed = "failed"
}
/**
 * Document-vs-Document Comparison Verdicts
 */
export declare enum ComparisonVerdict {
    ABetter = "A better",
    BBetter = "B better",
    Equivalent = "equivalent",
    OnlyInA = "only in A",
    OnlyInB = "only in B"
}
export declare enum SignificanceTier {
    Low = "low",
    Medium = "medium",
    High = "high"
}
/**
 * Evidence Grounding State
 */
export declare enum EvidenceStatus {
    Grounded = "grounded",
    InsufficientEvidence = "insufficient_evidence",
    NeedsManualReview = "needs_manual_review"
}
/**
 * Shared Legal Disclaimer
 */
export declare const LEGAL_DISCLAIMER = "This is plain-language information, not legal advice. Parity doesn't represent you and nothing here replaces a licensed attorney before you sign anything binding.";

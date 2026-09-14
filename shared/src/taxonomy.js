"use strict";
/**
 * Parity Canonical Taxonomy & Vocabulary
 * Strictly aligned with the Parity specification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEGAL_DISCLAIMER = exports.EvidenceStatus = exports.SignificanceTier = exports.ComparisonVerdict = exports.ProcessingStatus = exports.RISK_TIER_DESCRIPTIONS = exports.RiskTier = exports.ALL_CLAUSE_TYPES = exports.ClauseType = exports.DOCUMENT_TYPE_LABELS = exports.DocumentType = void 0;
var DocumentType;
(function (DocumentType) {
    DocumentType["FreelanceServices"] = "freelance_services";
    DocumentType["ResidentialLease"] = "residential_lease";
    DocumentType["PolicyToS"] = "policy_tos";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
exports.DOCUMENT_TYPE_LABELS = {
    [DocumentType.FreelanceServices]: 'Freelance / Services Agreement',
    [DocumentType.ResidentialLease]: 'Residential Lease Agreement',
    [DocumentType.PolicyToS]: 'Terms of Service / Privacy Policy',
};
/**
 * 20 Canonical Clause Types
 */
var ClauseType;
(function (ClauseType) {
    ClauseType["PaymentTerms"] = "Payment Terms";
    ClauseType["ScopeOfWork"] = "Scope of Work";
    ClauseType["IntellectualProperty"] = "Intellectual Property";
    ClauseType["Confidentiality"] = "Confidentiality";
    ClauseType["Indemnification"] = "Indemnification";
    ClauseType["LimitationOfLiability"] = "Limitation of Liability";
    ClauseType["Termination"] = "Termination";
    ClauseType["DisputeResolution"] = "Dispute Resolution";
    ClauseType["GoverningLaw"] = "Governing Law";
    ClauseType["NonCompeteNonSolicitation"] = "Non-Compete / Non-Solicitation";
    ClauseType["Insurance"] = "Insurance";
    ClauseType["Amendments"] = "Amendments";
    ClauseType["ForceMajeure"] = "Force Majeure";
    ClauseType["WarrantyRepresentations"] = "Warranty / Representations";
    ClauseType["Assignment"] = "Assignment";
    ClauseType["Notice"] = "Notice";
    ClauseType["DataUsePrivacy"] = "Data Use / Privacy";
    ClauseType["AutoRenewal"] = "Auto-Renewal";
    ClauseType["FeesRefunds"] = "Fees & Refunds";
    ClauseType["General"] = "General";
})(ClauseType || (exports.ClauseType = ClauseType = {}));
exports.ALL_CLAUSE_TYPES = Object.values(ClauseType);
/**
 * Exact User-Facing Risk Tiers
 */
var RiskTier;
(function (RiskTier) {
    RiskTier["Fair"] = "Fair";
    RiskTier["WorthASecondLook"] = "Worth a Second Look";
    RiskTier["RedFlag"] = "Red Flag";
})(RiskTier || (exports.RiskTier = RiskTier = {}));
exports.RISK_TIER_DESCRIPTIONS = {
    [RiskTier.Fair]: 'No meaningful disadvantage versus the benchmark.',
    [RiskTier.WorthASecondLook]: 'Shifts risk or obligation toward the signer, but remains within a range commonly used in real contracts.',
    [RiskTier.RedFlag]: 'Removes a standard protection, makes an obligation one-sided, or exposes the signer to open-ended cost or liability.',
};
/**
 * Processing lifecycle states
 */
var ProcessingStatus;
(function (ProcessingStatus) {
    ProcessingStatus["Queued"] = "queued";
    ProcessingStatus["Extracting"] = "extracting";
    ProcessingStatus["Segmenting"] = "segmenting";
    ProcessingStatus["Embedding"] = "embedding";
    ProcessingStatus["Analyzing"] = "analyzing";
    ProcessingStatus["Complete"] = "complete";
    ProcessingStatus["NeedsReview"] = "needs_review";
    ProcessingStatus["Failed"] = "failed";
})(ProcessingStatus || (exports.ProcessingStatus = ProcessingStatus = {}));
/**
 * Document-vs-Document Comparison Verdicts
 */
var ComparisonVerdict;
(function (ComparisonVerdict) {
    ComparisonVerdict["ABetter"] = "A better";
    ComparisonVerdict["BBetter"] = "B better";
    ComparisonVerdict["Equivalent"] = "equivalent";
    ComparisonVerdict["OnlyInA"] = "only in A";
    ComparisonVerdict["OnlyInB"] = "only in B";
})(ComparisonVerdict || (exports.ComparisonVerdict = ComparisonVerdict = {}));
var SignificanceTier;
(function (SignificanceTier) {
    SignificanceTier["Low"] = "low";
    SignificanceTier["Medium"] = "medium";
    SignificanceTier["High"] = "high";
})(SignificanceTier || (exports.SignificanceTier = SignificanceTier = {}));
/**
 * Evidence Grounding State
 */
var EvidenceStatus;
(function (EvidenceStatus) {
    EvidenceStatus["Grounded"] = "grounded";
    EvidenceStatus["InsufficientEvidence"] = "insufficient_evidence";
    EvidenceStatus["NeedsManualReview"] = "needs_manual_review";
})(EvidenceStatus || (exports.EvidenceStatus = EvidenceStatus = {}));
/**
 * Shared Legal Disclaimer
 */
exports.LEGAL_DISCLAIMER = "This is plain-language information, not legal advice. Parity doesn't represent you and nothing here replaces a licensed attorney before you sign anything binding.";

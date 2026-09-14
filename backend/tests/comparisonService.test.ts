import { compareDocuments, evaluateTopicHeuristically } from '../src/services/comparison/comparisonService';
import { ClauseType, ComparisonVerdict, SignificanceTier } from '@parity/shared';

describe('Document Comparison Module', () => {
  it('correctly identifies missing protections as only in A or only in B', () => {
    const textA = 'Tenant is entitled to quiet enjoyment between 10PM and 7AM.';
    const result = evaluateTopicHeuristically(ClauseType.General, textA, null);
    expect(result.verdict).toBe(ComparisonVerdict.OnlyInA);
    expect(result.significance).toBe(SignificanceTier.Medium);

    const resultB = evaluateTopicHeuristically(ClauseType.Insurance, null, 'Contractor must carry $2M policy.');
    expect(resultB.verdict).toBe(ComparisonVerdict.OnlyInB);
  });

  it('detects asymmetric risk shifts between two clauses', () => {
    const textA = 'Payment shall be remitted within thirty (30) days of invoice receipt.';
    const textB = 'Payment shall be remitted within ninety (90) days of final acceptance.';

    const result = evaluateTopicHeuristically(ClauseType.PaymentTerms, textA, textB);
    expect(result.verdict).toBe(ComparisonVerdict.ABetter);
    expect(result.significance).toBe(SignificanceTier.High);
  });

  it('generates full two-document comparison with summary tallies', async () => {
    const docA = [
      {
        clauseIndex: 1,
        clauseType: ClauseType.PaymentTerms,
        clauseText: 'Client shall pay Contractor within 30 days.',
      },
      {
        clauseIndex: 2,
        clauseType: ClauseType.Termination,
        clauseText: 'Either party may terminate upon 30 days notice.',
      },
      {
        clauseIndex: 3,
        clauseType: ClauseType.Confidentiality,
        clauseText: 'Both parties agree to hold information confidential for 2 years.',
      },
    ];

    const docB = [
      {
        clauseIndex: 1,
        clauseType: ClauseType.PaymentTerms,
        clauseText: 'Payment shall be issued within 90 days following final client approval.',
      },
      {
        clauseIndex: 2,
        clauseType: ClauseType.Termination,
        clauseText: 'Company may terminate immediately at any time without notice. Contractor forfeits unpaid work.',
      },
      {
        clauseIndex: 3,
        clauseType: ClauseType.NonCompeteNonSolicitation,
        clauseText: 'Contractor shall not work with any competitor for 24 months.',
      },
    ];

    const comparison = await compareDocuments(docA, docB, 'docA', 'docB', 'Standard Offer', 'Agency Offer');
    expect(comparison.topics.length).toBeGreaterThanOrEqual(4);
    expect(comparison.summary.aStrongerCount).toBeGreaterThan(0);
    expect(comparison.summary.missingProtectionCount).toBeGreaterThan(0);
    expect(comparison.summary.totalTopicsCompared).toBe(comparison.topics.length);
  });

  it('detects when Document B is better because Document A has predatory terms', () => {
    const textA = 'Contractor assumes unlimited liability and agrees to non-compete for 5 years without notice.';
    const textB = 'Liability is limited to fees paid under this agreement.';
    const result = evaluateTopicHeuristically(ClauseType.LimitationOfLiability, textA, textB);
    expect(result.verdict).toBe(ComparisonVerdict.BBetter);
    expect(result.significance).toBe(SignificanceTier.High);
  });

  it('evaluates identical or neutral terms as equivalent', () => {
    const textA = 'Governing law shall be the State of California.';
    const textB = 'Governing law shall be the State of California.';
    const result = evaluateTopicHeuristically(ClauseType.GoverningLaw, textA, textB);
    expect(result.verdict).toBe(ComparisonVerdict.Equivalent);
    expect(result.significance).toBe(SignificanceTier.Low);
  });

  it('defaults to General topic when comparing empty documents', async () => {
    const comparison = await compareDocuments([], [], 'emptyA', 'emptyB');
    expect(comparison.topics.length).toBe(1);
    expect(comparison.topics[0].topic).toBe(ClauseType.General);
  });

  it('correctly compares same document against itself (all equivalent, 0 missing)', async () => {
    const doc = [
      { clauseIndex: 1, clauseType: ClauseType.PaymentTerms, clauseText: 'Payment net 30 days.' },
      { clauseIndex: 2, clauseType: ClauseType.Termination, clauseText: 'Termination upon 30 days notice.' },
    ];

    const comparison = await compareDocuments(doc, doc, 'doc1', 'doc1_copy');
    expect(comparison.topics.length).toBe(2);
    expect(comparison.summary.aStrongerCount).toBe(0);
    expect(comparison.summary.bStrongerCount).toBe(0);
    expect(comparison.summary.missingProtectionCount).toBe(0);
    expect(comparison.topics.every((t) => t.verdict === ComparisonVerdict.Equivalent)).toBe(true);
  });

  it('aligns clauses by topic and semantic content, not by section index or clause order', async () => {
    // Document A has Order: 1. Termination, 2. Payment
    const docA = [
      { clauseIndex: 1, clauseType: ClauseType.Termination, clauseText: 'Termination upon 30 days notice.' },
      { clauseIndex: 2, clauseType: ClauseType.PaymentTerms, clauseText: 'Payment within 30 days.' },
    ];

    // Document B has Reversed Order: 1. Payment, 2. Termination
    const docB = [
      { clauseIndex: 1, clauseType: ClauseType.PaymentTerms, clauseText: 'Payment within 30 days.' },
      { clauseIndex: 2, clauseType: ClauseType.Termination, clauseText: 'Termination upon 30 days notice.' },
    ];

    const comparison = await compareDocuments(docA, docB, 'docA', 'docB');
    expect(comparison.topics.length).toBe(2);

    const paymentTopic = comparison.topics.find((t) => t.topic === ClauseType.PaymentTerms);
    expect(paymentTopic).toBeDefined();
    expect(paymentTopic?.docAText).toBe('Payment within 30 days.');
    expect(paymentTopic?.docBText).toBe('Payment within 30 days.');
    expect(paymentTopic?.verdict).toBe(ComparisonVerdict.Equivalent);

    const termTopic = comparison.topics.find((t) => t.topic === ClauseType.Termination);
    expect(termTopic).toBeDefined();
    expect(termTopic?.docAText).toBe('Termination upon 30 days notice.');
    expect(termTopic?.docBText).toBe('Termination upon 30 days notice.');
    expect(termTopic?.verdict).toBe(ComparisonVerdict.Equivalent);
  });
});


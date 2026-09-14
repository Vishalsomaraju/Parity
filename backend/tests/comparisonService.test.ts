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
});

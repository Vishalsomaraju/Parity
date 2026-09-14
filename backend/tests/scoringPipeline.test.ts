import { evaluateClauseHeuristically, scoreClauses } from '../src/services/scoring/scoringPipeline';
import { ClauseType, DocumentType, RiskTier } from '@parity/shared';

describe('Scoring Pipeline Module', () => {
  it('correctly flags predatory terms as Red Flag', () => {
    const predatoryClause =
      'Contractor agrees to unlimited liability and forfeits all accrued compensation if terminated by Company without limitation.';
    const result = evaluateClauseHeuristically(predatoryClause, ClauseType.LimitationOfLiability);
    expect(result.tier).toBe(RiskTier.RedFlag);
    expect(result.reasonCodes).toContain('OPEN_ENDED_LIABILITY');
  });

  it('correctly flags restrictive operational terms as Worth a Second Look', () => {
    const restrictiveClause = 'Payment shall be remitted within 90 days of final acceptance (Net-90 terms).';
    const result = evaluateClauseHeuristically(restrictiveClause, ClauseType.PaymentTerms);
    expect(result.tier).toBe(RiskTier.WorthASecondLook);
  });

  it('correctly identifies market-standard mutual clauses as Fair', () => {
    const fairClause = 'Either party may terminate upon thirty (30) days prior written notice.';
    const result = evaluateClauseHeuristically(fairClause, ClauseType.Termination);
    expect(result.tier).toBe(RiskTier.Fair);
  });

  it('runs complete scoring pipeline over multiple clauses', async () => {
    const clauses = [
      {
        clauseIndex: 1,
        clauseType: ClauseType.PaymentTerms,
        sectionTitle: 'Section 1: Payment',
        clauseText: 'Client shall pay Contractor within thirty (30) days of receiving an invoice.',
        contentHash: 'hash1',
      },
      {
        clauseIndex: 2,
        clauseType: ClauseType.LimitationOfLiability,
        sectionTitle: 'Section 2: Liability',
        clauseText: 'Company liability is capped at $100 while Contractor agrees to unlimited liability without limitation.',
        contentHash: 'hash2',
      },
    ];

    const scored = await scoreClauses(clauses, DocumentType.FreelanceServices);
    expect(scored.length).toBe(2);
    expect(scored[0].clauseIndex).toBe(1);
    expect(scored[1].riskTier).toBe(RiskTier.RedFlag);
    expect(scored[1].whyItMatters).toBeDefined();
  });
});

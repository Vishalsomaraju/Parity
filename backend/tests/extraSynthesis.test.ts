import { generateFinePrint } from '../src/services/synthesis/finePrintService';
import { extractTimeline } from '../src/services/synthesis/timelineService';
import { extractObligations } from '../src/services/synthesis/obligationsService';
import { extractKeyTerms } from '../src/services/synthesis/keyTermsService';
import { ClauseType, RiskTier } from '@parity/shared';

describe('Synthesis Edge Cases', () => {
  it('handles empty flagged clauses in fine print gracefully', async () => {
    const emptyResult = await generateFinePrint([]);
    expect(emptyResult.length).toBe(1);
    expect(emptyResult[0].tier).toBe(RiskTier.Fair);
    expect(emptyResult[0].title).toContain('Market Protections Intact');
  });

  it('translates various clause types into fine print headlines', async () => {
    const diverseClauses = [
      {
        clauseIndex: 1,
        clauseType: ClauseType.Notice,
        clauseText: 'Landlord may enter premises at any hour without prior notice.',
        riskTier: RiskTier.RedFlag,
        riskExplanation: 'Landlord entry without warning.',
      },
      {
        clauseIndex: 2,
        clauseType: ClauseType.PaymentTerms,
        clauseText: 'Invoices shall be paid within 90 days following acceptance.',
        riskTier: RiskTier.WorthASecondLook,
        riskExplanation: 'Net-90 payment schedule.',
      },
      {
        clauseIndex: 3,
        clauseType: ClauseType.LimitationOfLiability,
        clauseText: 'Liability is capped to fees paid under this agreement.',
        riskTier: RiskTier.Fair,
        riskExplanation: 'Reciprocal fee cap.',
      },
    ];

    const fps = await generateFinePrint(diverseClauses);
    expect(fps.length).toBe(2);
    expect(fps[0].tier).toBe(RiskTier.RedFlag);
    expect(fps[0].title).toContain('without notice');
  });

  it('extracts various durations into timeline milestones', async () => {
    const clauses = [
      {
        clauseIndex: 1,
        clauseType: ClauseType.Termination,
        clauseText: 'Breach must be cured within 15 days of notice, and 60 days written notice to terminate.',
      },
      {
        clauseIndex: 2,
        clauseType: ClauseType.NonCompeteNonSolicitation,
        clauseText: 'Restriction continues for 12 months after termination.',
      },
      {
        clauseIndex: 3,
        clauseType: ClauseType.PaymentTerms,
        clauseText: 'Payment horizon extends up to 90 days.',
      },
    ];

    const tl = await extractTimeline(clauses);
    expect(tl.length).toBeGreaterThanOrEqual(3);
    const timings = tl.map((t) => t.timing);
    expect(timings).toContain('15 days');
    expect(timings).toContain('12 months');
    expect(timings).toContain('90 days');
  });

  it('handles empty clauses in timeline by providing effective date', async () => {
    const tl = await extractTimeline([]);
    expect(tl.length).toBe(1);
    expect(tl[0].milestone).toBe('Effective Date');
  });

  it('extracts obligations for residential leases and contractor duties', async () => {
    const leaseClauses = [
      {
        clauseIndex: 1,
        clauseType: ClauseType.PaymentTerms,
        clauseText: 'Tenant shall pay rent due promptly on the first of each month.',
      },
      {
        clauseIndex: 2,
        clauseType: ClauseType.Notice,
        clauseText: 'Landlord shall give at least 24 hours advance notice before entering.',
      },
    ];

    const obs = await extractObligations(leaseClauses);
    expect(obs.yourObligations.length).toBeGreaterThan(0);
    expect(obs.theirObligations.length).toBeGreaterThan(0);
  });

  it('extracts key terms with missing fields returning null', async () => {
    const shortText = 'Agreement without parties or duration.';
    const terms = await extractKeyTerms(shortText, []);
    expect(terms.duration).toBeNull();
    expect(terms.deposit).toBeNull();
  });
});

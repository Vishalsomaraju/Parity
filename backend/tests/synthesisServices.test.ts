import { generateFinePrint } from '../src/services/synthesis/finePrintService';
import { extractObligations } from '../src/services/synthesis/obligationsService';
import { extractTimeline } from '../src/services/synthesis/timelineService';
import { extractKeyTerms } from '../src/services/synthesis/keyTermsService';
import { ClauseType, RiskTier } from '@parity/shared';

describe('Synthesis Services Module', () => {
  const clauses = [
    {
      clauseIndex: 1,
      clauseType: ClauseType.PaymentTerms,
      clauseText: 'Client shall pay Contractor $85.00 per hour within 30 days of receiving an invoice.',
      riskTier: RiskTier.Fair,
      riskExplanation: 'Market-standard Net-30 payment terms.',
    },
    {
      clauseIndex: 2,
      clauseType: ClauseType.Termination,
      clauseText: 'Company may terminate at any time and Contractor forfeits all accrued compensation.',
      riskTier: RiskTier.RedFlag,
      riskExplanation: 'Forfeiture of unpaid work on cancellation.',
    },
    {
      clauseIndex: 3,
      clauseType: ClauseType.Confidentiality,
      clauseText: 'Contractor must keep all information confidential for 24 months.',
      riskTier: RiskTier.WorthASecondLook,
      riskExplanation: 'Standard confidentiality obligations.',
    },
  ];

  it('generates fine print ordered with Red Flags first', async () => {
    const finePrint = await generateFinePrint(clauses);
    expect(finePrint.length).toBeGreaterThan(0);
    expect(finePrint[0].tier).toBe(RiskTier.RedFlag);
    expect(finePrint[0].title).toBeDefined();
    expect(finePrint[0].explanation).toBeDefined();
  });

  it('partitions obligations by party', async () => {
    const obligations = await extractObligations(clauses);
    expect(obligations.yourObligations.length).toBeGreaterThan(0);
    expect(obligations.theirObligations.length).toBeGreaterThan(0);
  });

  it('extracts contractual timeline items', async () => {
    const timeline = await extractTimeline(clauses);
    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline[0].timing).toBeDefined();
  });

  it('extracts key terms from contract text', async () => {
    const fullText = `Agreement between Apex Media LLC and Jordan Taylor. Client shall pay Contractor $85.00 per hour within 30 days written notice.`;
    const keyTerms = await extractKeyTerms(fullText, clauses);
    expect(keyTerms.parties.length).toBeGreaterThanOrEqual(2);
    expect(keyTerms.payment).toBe('$85.00 per hour');
  });
});

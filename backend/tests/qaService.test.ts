import { answerContextualQuestion } from '../src/services/qa/qaService';
import { ClauseType, EvidenceStatus } from '@parity/shared';

describe('Contextual Q&A Module', () => {
  const sampleClauses = [
    {
      id: 'cl_1',
      clauseIndex: 1,
      clauseType: ClauseType.PaymentTerms,
      sectionTitle: 'Section 1: Payment',
      pageNumber: 1,
      clauseText: 'Client shall pay Contractor the sum of $85.00 per hour, invoiced bi-weekly. Client agrees to remit payment within thirty (30) days of invoice receipt.',
    },
    {
      id: 'cl_2',
      clauseIndex: 2,
      clauseType: ClauseType.Termination,
      sectionTitle: 'Section 2: Termination',
      pageNumber: 2,
      clauseText: 'Either party may terminate this Agreement without cause upon thirty (30) days prior written notice.',
    },
  ];

  it('answers grounded questions with exact clause and page citations', async () => {
    const res = await answerContextualQuestion('When does the client have to pay?', sampleClauses);
    expect(res.status).toBe(EvidenceStatus.Grounded);
    expect(res.supportingClauseId).toBe('cl_1');
    expect(res.pageNumber).toBe(1);
    expect(res.verbatimQuote).toBeDefined();
    expect(res.verbatimQuote?.length).toBeGreaterThan(5);
  });

  it('returns insufficient_evidence when question is completely unaddressed', async () => {
    const res = await answerContextualQuestion('Can I keep pets in the apartment?', sampleClauses);
    expect(res.status).toBe(EvidenceStatus.InsufficientEvidence);
    expect(res.answer).toContain("couldn't find");
    expect(res.supportingClauseId).toBeNull();
  });
});

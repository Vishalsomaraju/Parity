import { splitByRegex, classifyHeading, splitDocumentIntoClauses } from '../src/services/segmentation/clauseSplitter';
import { ClauseType, DocumentType } from '@parity/shared';

describe('Clause Splitter Module', () => {
  const sampleContract = `
MASTER SERVICES AGREEMENT

1. SCOPE OF WORK
Contractor shall perform UI design services.

2. PAYMENT TERMS
Client shall pay Contractor within 30 days of invoice receipt.

3. TERMINATION
Either party may terminate upon 30 days notice.

4. INDEMNIFICATION
Each party shall indemnify the other from third party claims.
  `.trim();

  it('correctly extracts sections using regex patterns', () => {
    const clauses = splitByRegex(sampleContract);
    expect(clauses.length).toBe(5);
    expect(clauses[0].clauseType).toBe(ClauseType.ScopeOfWork);
    expect(clauses[1].clauseType).toBe(ClauseType.ScopeOfWork);
    expect(clauses[2].clauseType).toBe(ClauseType.PaymentTerms);
    expect(clauses[3].clauseType).toBe(ClauseType.Termination);
    expect(clauses[4].clauseType).toBe(ClauseType.Indemnification);
  });

  it('classifies headings into correct canonical ClauseTypes', () => {
    expect(classifyHeading('Payment Terms')).toBe(ClauseType.PaymentTerms);
    expect(classifyHeading('Compensation and Invoicing')).toBe(ClauseType.PaymentTerms);
    expect(classifyHeading('Limitation of Liability')).toBe(ClauseType.LimitationOfLiability);
    expect(classifyHeading('Confidentiality and Non-Disclosure')).toBe(ClauseType.Confidentiality);
    expect(classifyHeading('Arbitration and Dispute Resolution')).toBe(ClauseType.DisputeResolution);
    expect(classifyHeading('Warranty of Habitability')).toBe(ClauseType.WarrantyRepresentations);
    expect(classifyHeading('Random Unrelated Title')).toBe(ClauseType.General);
  });

  it('splits unstructured documents by paragraphs when no headings exist', async () => {
    const rawParagraphs = `
This is the first long paragraph explaining all the deliverables and work that the contractor is expected to build.

This is the second distinct paragraph discussing how payments, fees, and compensation will be handled on a monthly basis.

This is the third paragraph detailing what happens if either party terminates the agreement with 30 days notice.
    `.trim();

    const clauses = await splitDocumentIntoClauses(rawParagraphs, DocumentType.FreelanceServices);
    expect(clauses.length).toBeGreaterThanOrEqual(3);
  });
});

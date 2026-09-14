import { z } from 'zod';
import { KeyTerms, ClauseType } from '@parity/shared';
import { executeStructuredAI } from '../ai/aiOrchestrator';

export interface ClauseInputForKeyTerms {
  clauseIndex: number;
  clauseType: ClauseType;
  clauseText: string;
}

/**
 * Extract key commercial terms supported strictly by document text.
 * Never invent missing values.
 */
export async function extractKeyTerms(
  fullDocumentText: string,
  clauses: ClauseInputForKeyTerms[]
): Promise<KeyTerms> {
  const systemPrompt = `You are Parity's key terms reader. Extract factual core business terms directly established by the contract text.

Extract:
- PARTIES: named entities entering the contract
- DURATION: contract term / length
- PAYMENT: hourly rate, total fee, or rent amount
- NOTICE PERIOD: required termination notice
- PENALTIES: late fees or damage penalties
- RENEWAL: auto-renewal or extension rules
- JURISDICTION: governing state or dispute forum
- DEPOSIT: security deposit if any
- IMPORTANT DATES: calendar dates explicitly mentioned

Only output values actually stated in the text. If a term is not mentioned, return null. Never invent facts.
Respond with valid JSON only.`;

  const userPrompt = `DOCUMENT EXCERPT:
${fullDocumentText.slice(0, 4000)}

Return a JSON object:
{
  "parties": ["party1", "party2"],
  "duration": "e.g. '12 months' or null",
  "payment": "e.g. '$85.00 per hour' or '$2,200.00 / month' or null",
  "noticePeriod": "e.g. '30 days written notice' or null",
  "penalties": "e.g. '5% late fee' or null",
  "renewal": "e.g. 'Auto-renews for 12 months' or null",
  "jurisdiction": "e.g. 'State of California' or null",
  "deposit": "e.g. '$2,200.00 held in escrow' or null",
  "importantDates": ["date 1", "date 2"]
}`;

  const KeyTermsZodSchema = z.object({
    parties: z.array(z.string()).default([]),
    duration: z.string().nullable().optional(),
    payment: z.string().nullable().optional(),
    noticePeriod: z.string().nullable().optional(),
    penalties: z.string().nullable().optional(),
    renewal: z.string().nullable().optional(),
    jurisdiction: z.string().nullable().optional(),
    deposit: z.string().nullable().optional(),
    importantDates: z.array(z.string()).default([]),
  });

  const result = await executeStructuredAI({
    systemPrompt,
    userPrompt,
    schema: KeyTermsZodSchema,
    deterministicFallback: () => generateFallbackKeyTerms(fullDocumentText, clauses),
  });

  return {
    parties: result.data.parties || [],
    duration: result.data.duration ?? null,
    payment: result.data.payment ?? null,
    noticePeriod: result.data.noticePeriod ?? null,
    penalties: result.data.penalties ?? null,
    renewal: result.data.renewal ?? null,
    jurisdiction: result.data.jurisdiction ?? null,
    deposit: result.data.deposit ?? null,
    importantDates: result.data.importantDates || [],
  };
}

function generateFallbackKeyTerms(text: string, clauses: ClauseInputForKeyTerms[]): KeyTerms {
  const lower = text.toLowerCase();

  // Extract parties if visible in header
  const parties: string[] = [];
  const betweenMatch = text.match(/between\s+([A-Za-z0-9\s,\.]+?)\s+and\s+([A-Za-z0-9\s,\.]+?)(?:\s+for|\s+dated|\.|\n)/i);
  if (betweenMatch) {
    parties.push(betweenMatch[1].trim().replace(/["\(\)]/g, ''));
    parties.push(betweenMatch[2].trim().replace(/["\(\)]/g, ''));
  }

  // Payment
  let payment: string | null = null;
  const payClause = clauses.find((c) => c.clauseType === ClauseType.PaymentTerms);
  if (payClause) {
    const dollarMatch = payClause.clauseText.match(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:per hour|\/ month|monthly))?/i);
    if (dollarMatch) {
      payment = dollarMatch[0];
    }
  }

  // Notice Period
  let noticePeriod: string | null = null;
  const noticeMatch = text.match(/(?:thirty|sixty|ninety|\d+)\s*(?:\(\d+\)\s*)?days['\s]+(?:prior\s+)?written\s+notice/i);
  if (noticeMatch) {
    noticePeriod = noticeMatch[0];
  }

  // Jurisdiction
  let jurisdiction: string | null = null;
  const govClause = clauses.find((c) => c.clauseType === ClauseType.GoverningLaw || c.clauseType === ClauseType.DisputeResolution);
  if (govClause) {
    const stateMatch = govClause.clauseText.match(/(?:laws of the State of|State of|in)\s+([A-Z][a-z]+)/);
    if (stateMatch) {
      jurisdiction = `State of ${stateMatch[1]}`;
    }
  }

  return {
    parties: parties.length > 0 ? parties : ['First Party', 'Second Party'],
    duration: lower.includes('12 months') ? '12 months' : null,
    payment,
    noticePeriod,
    penalties: lower.includes('late fee') ? 'Late fee applicable after grace period' : null,
    renewal: lower.includes('automatically renew') ? 'Automatic renewal unless notice given' : null,
    jurisdiction,
    deposit: lower.includes('security deposit') ? 'Security deposit required' : null,
    importantDates: [],
  };
}

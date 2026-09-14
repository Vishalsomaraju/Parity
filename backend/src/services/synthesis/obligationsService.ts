import { z } from 'zod';
import { Obligations, ClauseType } from '@parity/shared';
import { executeStructuredAI } from '../ai/aiOrchestrator';

export interface ClauseInput {
  clauseIndex: number;
  clauseType: ClauseType;
  clauseText: string;
}

/**
 * Extract contractual obligations partitioned into:
 * "Your Obligations" (e.g., Contractor, Tenant, User) vs "Their Obligations" (Client, Landlord, Company).
 */
export async function extractObligations(clauses: ClauseInput[]): Promise<Obligations> {
  const systemPrompt = `You are Parity's contract obligation reader. Extract affirmative contractual duties and categorize them strictly by which party must perform them.

Separate into:
- YOUR OBLIGATIONS (contractor, tenant, consumer/user)
- THEIR OBLIGATIONS (client, landlord, platform/company)

Work only from the provided text — never invent obligations that aren't stated.
Respond with valid JSON only.`;

  const userPrompt = `CLAUSES:
${JSON.stringify(
  clauses.map((c) => ({
    index: c.clauseIndex,
    topic: c.clauseType,
    text: c.clauseText.slice(0, 400),
  })),
  null,
  2
)}

Return a JSON object:
{
  "yourObligations": [
    {
      "description": "actionable task, e.g. 'Submit invoices bi-weekly upon milestone completion'",
      "clauseIndex": <number>,
      "isCritical": <boolean>
    }
  ],
  "theirObligations": [
    {
      "description": "actionable task, e.g. 'Pay undisputed invoices within 30 days'",
      "clauseIndex": <number>,
      "isCritical": <boolean>
    }
  ]
}`;

  const ObligationsSchema = z.object({
    yourObligations: z.array(
      z.object({
        description: z.string(),
        clauseIndex: z.number().optional(),
        isCritical: z.boolean().default(false),
      })
    ),
    theirObligations: z.array(
      z.object({
        description: z.string(),
        clauseIndex: z.number().optional(),
        isCritical: z.boolean().default(false),
      })
    ),
  });

  const result = await executeStructuredAI({
    systemPrompt,
    userPrompt,
    schema: ObligationsSchema,
    deterministicFallback: () => generateFallbackObligations(clauses),
  });

  return {
    yourObligations: result.data.yourObligations.map((o, idx) => ({
      id: `ob_your_${idx + 1}`,
      description: o.description,
      clauseIndex: o.clauseIndex,
      isCritical: o.isCritical || false,
    })),
    theirObligations: result.data.theirObligations.map((o, idx) => ({
      id: `ob_their_${idx + 1}`,
      description: o.description,
      clauseIndex: o.clauseIndex,
      isCritical: o.isCritical || false,
    })),
  };
}

function generateFallbackObligations(clauses: ClauseInput[]): {
  yourObligations: Array<{ description: string; clauseIndex?: number; isCritical: boolean }>;
  theirObligations: Array<{ description: string; clauseIndex?: number; isCritical: boolean }>;
} {
  const your: Array<{ description: string; clauseIndex?: number; isCritical: boolean }> = [];
  const their: Array<{ description: string; clauseIndex?: number; isCritical: boolean }> = [];

  for (const c of clauses) {
    const text = c.clauseText.toLowerCase();

    if (c.clauseType === ClauseType.PaymentTerms) {
      if (text.includes('client shall pay') || text.includes('company shall')) {
        their.push({
          description: 'Remit agreed payment in accordance with invoice schedule',
          clauseIndex: c.clauseIndex,
          isCritical: true,
        });
      }
      if (text.includes('tenant shall pay') || text.includes('due promptly on the first')) {
        your.push({
          description: 'Pay monthly rent on or before the 1st of each calendar month',
          clauseIndex: c.clauseIndex,
          isCritical: true,
        });
      }
    }

    if (c.clauseType === ClauseType.Termination) {
      if (text.includes('prior written notice')) {
        your.push({
          description: 'Provide required written advance notice prior to termination',
          clauseIndex: c.clauseIndex,
          isCritical: false,
        });
      }
    }

    if (c.clauseType === ClauseType.Confidentiality) {
      your.push({
        description: 'Maintain strict confidentiality over proprietary information',
        clauseIndex: c.clauseIndex,
        isCritical: false,
      });
      their.push({
        description: 'Hold received contractor confidential information in confidence',
        clauseIndex: c.clauseIndex,
        isCritical: false,
      });
    }

    if (c.clauseType === ClauseType.Notice && text.includes('24')) {
      their.push({
        description: 'Provide at least 24 hours advance written notice prior to entering premises',
        clauseIndex: c.clauseIndex,
        isCritical: false,
      });
    }
  }

  return { yourObligations: your, theirObligations: their };
}

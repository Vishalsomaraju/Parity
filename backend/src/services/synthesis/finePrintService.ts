import { z } from 'zod';
import { FinePrintItem, RiskTier, ClauseType } from '@parity/shared';
import { executeStructuredAI } from '../ai/aiOrchestrator';

export interface ClauseSummaryForFinePrint {
  clauseIndex: number;
  clauseType: ClauseType;
  clauseText: string;
  riskTier: RiskTier;
  riskExplanation: string;
}

/**
 * Generate flagship "Fine Print, Translated" items (Section 17 specification).
 * One practical implication per item. Ordered by severity: Red Flags first.
 */
export async function generateFinePrint(
  flaggedClauses: ClauseSummaryForFinePrint[]
): Promise<FinePrintItem[]> {
  if (flaggedClauses.length === 0) {
    return [
      {
        id: `fp_standard_1`,
        title: 'Standard Market Protections Intact',
        explanation: 'The agreement contains standard terms without major unhedged liabilities or unusual signer burdens.',
        tier: RiskTier.Fair,
        relatedClauseIndex: 1,
      },
    ];
  }

  // Filter for clauses that deserve highlighting (Red Flags and Worth a Second Look)
  const candidates = flaggedClauses.filter(
    (c) => c.riskTier === RiskTier.RedFlag || c.riskTier === RiskTier.WorthASecondLook
  );

  const targets = candidates.length > 0 ? candidates : flaggedClauses.slice(0, 3);

  const systemPrompt = `You are Parity, writing the summary someone actually wants: what does this document really mean for me, in the words a knowledgeable friend would use if they'd read the whole thing so you didn't have to.

This is plain-language information, not legal advice. Parity doesn't represent you and nothing here replaces a licensed attorney before you sign anything binding.

No legal jargon. No hedging. If something is a real problem, say so plainly.

Respond with valid JSON only.`;

  const userPrompt = `Flagged items from this document:
${JSON.stringify(
  targets.map((t) => ({
    index: t.clauseIndex,
    topic: t.clauseType,
    text: t.clauseText.slice(0, 350),
    severity: t.riskTier,
  })),
  null,
  2
)}

Return a JSON object:
{
  "items": [
    {
      "title": "short, plain-spoken headline, e.g. 'You can't leave without 60 days notice'",
      "explanation": "1-2 sentences on the real-world consequence.",
      "tier": "Red Flag" | "Worth a Second Look" | "Fair",
      "relatedClauseIndex": <index from input>
    }
  ]
}

Order by severity, Red Flag first.`;

  const FinePrintSchema = z.object({
    items: z.array(
      z.object({
        title: z.string(),
        explanation: z.string(),
        tier: z.nativeEnum(RiskTier),
        relatedClauseIndex: z.number(),
      })
    ),
  });

  const result = await executeStructuredAI({
    systemPrompt,
    userPrompt,
    schema: FinePrintSchema,
    deterministicFallback: () => ({
      items: targets.map((t) => generateFallbackFinePrintItem(t)),
    }),
  });

  const items = result.data.items.map((item, idx) => ({
    id: `fp_${Date.now()}_${idx + 1}`,
    title: item.title,
    explanation: item.explanation,
    tier: item.tier,
    relatedClauseIndex: item.relatedClauseIndex,
    relatedClauseType: targets.find((t) => t.clauseIndex === item.relatedClauseIndex)?.clauseType,
  }));

  // Ensure strict ordering: Red Flag first, then Worth a Second Look, then Fair
  items.sort((a, b) => {
    const rank: Record<RiskTier, number> = {
      [RiskTier.RedFlag]: 1,
      [RiskTier.WorthASecondLook]: 2,
      [RiskTier.Fair]: 3,
    };
    return (rank[a.tier] || 3) - (rank[b.tier] || 3);
  });

  return items;
}

function generateFallbackFinePrintItem(clause: ClauseSummaryForFinePrint): {
  title: string;
  explanation: string;
  tier: RiskTier;
  relatedClauseIndex: number;
} {
  const lower = clause.clauseText.toLowerCase();

  if (clause.clauseType === ClauseType.Termination) {
    if (lower.includes('forfeits') || lower.includes('unaccepted')) {
      return {
        title: 'You forfeit unpaid work if they cancel',
        explanation: 'If the company terminates early, you lose compensation for any work not yet accepted.',
        tier: RiskTier.RedFlag,
        relatedClauseIndex: clause.clauseIndex,
      };
    }
    return {
      title: 'Extended notice requirement to terminate',
      explanation: 'You must provide substantial advance written notice before ending this agreement.',
      tier: RiskTier.WorthASecondLook,
      relatedClauseIndex: clause.clauseIndex,
    };
  }

  if (clause.clauseType === ClauseType.LimitationOfLiability) {
    if (lower.includes('unlimited liability')) {
      return {
        title: 'Your financial liability has no ceiling',
        explanation: 'The other party caps their liability to nominal fees, but your exposure is open-ended and unlimited.',
        tier: RiskTier.RedFlag,
        relatedClauseIndex: clause.clauseIndex,
      };
    }
    return {
      title: 'Liability cap applies to both parties',
      explanation: 'Damages are restricted to recent fees paid under the contract.',
      tier: RiskTier.Fair,
      relatedClauseIndex: clause.clauseIndex,
    };
  }

  if (clause.clauseType === ClauseType.PaymentTerms) {
    if (lower.includes('90') || lower.includes('withhold')) {
      return {
        title: 'Payments can be delayed up to 90 days',
        explanation: 'Invoices may be withheld or take several months to remit following deliverable acceptance.',
        tier: RiskTier.WorthASecondLook,
        relatedClauseIndex: clause.clauseIndex,
      };
    }
  }

  if (clause.clauseType === ClauseType.Notice && lower.includes('without')) {
    return {
      title: 'Entry permitted anytime without notice',
      explanation: 'The landlord reserves unrestricted rights to enter the unit at any hour without prior warning.',
      tier: RiskTier.RedFlag,
      relatedClauseIndex: clause.clauseIndex,
    };
  }

  return {
    title: `Key terms governing ${clause.clauseType}`,
    explanation: clause.riskExplanation || 'Review the details of this clause to ensure terms match your expectations.',
    tier: clause.riskTier,
    relatedClauseIndex: clause.clauseIndex,
  };
}

import { z } from 'zod';
import { TimelineItem, ClauseType } from '@parity/shared';
import { executeStructuredAI } from '../ai/aiOrchestrator';

export interface ClauseInputForTimeline {
  clauseIndex: number;
  clauseType: ClauseType;
  clauseText: string;
}

/**
 * Extract chronological contractual milestones, deadlines, and durations.
 */
export async function extractTimeline(clauses: ClauseInputForTimeline[]): Promise<TimelineItem[]> {
  const systemPrompt = `You are Parity's contract timeline reader. Extract contractual dates, durations, and deadlines.

Identify:
- Explicit dates (e.g., "October 1, 2025", "September 1, 2026")
- Explicit durations (e.g., "15 days to cure", "30 days written notice", "12 months")
- Inferred milestones

Do not invent calendar dates if only durations are provided.
Respond with valid JSON only.`;

  const userPrompt = `CLAUSES:
${JSON.stringify(
  clauses.map((c) => ({
    topic: c.clauseType,
    text: c.clauseText.slice(0, 300),
  })),
  null,
  2
)}

Return a JSON object:
{
  "milestones": [
    {
      "milestone": "short title, e.g. 'Cure Period for Breach'",
      "timing": "e.g. '15 days' or 'October 1, 2025'",
      "type": "explicit_date" | "duration" | "inferred",
      "description": "1 sentence on what must happen."
    }
  ]
}`;

  const TimelineSchema = z.object({
    milestones: z.array(
      z.object({
        milestone: z.string(),
        timing: z.string(),
        type: z.enum(['explicit_date', 'duration', 'inferred']),
        description: z.string(),
      })
    ),
  });

  const result = await executeStructuredAI({
    systemPrompt,
    userPrompt,
    schema: TimelineSchema,
    deterministicFallback: () => generateFallbackTimeline(clauses),
  });

  return result.data.milestones.map((m, idx) => ({
    id: `tl_${idx + 1}`,
    milestone: m.milestone,
    timing: m.timing,
    type: m.type,
    description: m.description,
    relativeOrder: idx + 1,
  }));
}

function generateFallbackTimeline(clauses: ClauseInputForTimeline[]): {
  milestones: Array<{
    milestone: string;
    timing: string;
    type: 'explicit_date' | 'duration' | 'inferred';
    description: string;
  }>;
} {
  const list: Array<{
    milestone: string;
    timing: string;
    type: 'explicit_date' | 'duration' | 'inferred';
    description: string;
  }> = [];

  for (const c of clauses) {
    const text = c.clauseText;
    const lower = text.toLowerCase();

    // Look for day durations
    if (lower.includes('30 days') || lower.includes('thirty (30) days')) {
      list.push({
        milestone: `${c.clauseType} Notice / Payment Window`,
        timing: '30 days',
        type: 'duration',
        description: 'Standard 30-day notice requirement or invoice payment term.',
      });
    } else if (lower.includes('15 days') || lower.includes('fifteen (15) days')) {
      list.push({
        milestone: 'Breach Cure Period',
        timing: '15 days',
        type: 'duration',
        description: 'Time granted to remedy a reported material breach before termination.',
      });
    } else if (lower.includes('60 days') || lower.includes('sixty (60) days')) {
      list.push({
        milestone: 'Extended Notice Period',
        timing: '60 days',
        type: 'duration',
        description: 'Advance notice required before terminating or non-renewing agreement.',
      });
    } else if (lower.includes('90 days') || lower.includes('ninety (90) days')) {
      list.push({
        milestone: 'Long-Horizon Payment or Restriction',
        timing: '90 days',
        type: 'duration',
        description: 'Extended operational window or payment delay terms.',
      });
    } else if (lower.includes('12 months') || lower.includes('twelve (12) months')) {
      list.push({
        milestone: 'Post-Termination Covenant',
        timing: '12 months',
        type: 'duration',
        description: 'Duration of non-solicitation or confidentiality survival following contract end.',
      });
    }
  }

  if (list.length === 0) {
    list.push({
      milestone: 'Effective Date',
      timing: 'Upon signing',
      type: 'inferred',
      description: 'Terms take effect immediately upon signature by both parties.',
    });
  }

  return { milestones: list };
}
